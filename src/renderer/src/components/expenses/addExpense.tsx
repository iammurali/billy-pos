import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@/ui/sheet'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/ui/form'
import { Input } from '@/ui/input'
import { toast } from 'sonner'
import { useEffect, useState } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@renderer/ui/popover'
import { Command, CommandInput, CommandItem, CommandList } from '@renderer/ui/command'
import { CommandEmpty } from 'cmdk'

const formSchema = z.object({
  id: z.any(),
  title: z.string().min(2).max(50),
  description: z.string().min(2).max(50).optional(),
  amount: z.coerce.number({ message: 'Amount is required' }),
  category: z.coerce.number({ message: 'category is required' }),
  categoryName: z.string().optional()
})

export function AddExpense({ getExpenses }: { getExpenses: () => void }) {
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [categories, setCategories] = useState<ExpenseCategory[]>([])

  const [newCategory, setNewCategory] = useState('')
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {}
  })

  useEffect(() => {
    getExpenseCategories()
  }, [])

  const getExpenseCategories = async () => {
    try {
      const dbItems: ExpenseCategory[] =
        await window.electron.ipcRenderer.invoke('getExpenseCategories')
      setCategories(dbItems)
    } catch (error) {
      console.log('error::', error)
    }
  }

  const handleCategoryChange = async (name: string) => {
    const existingCategory = categories.find((c) => c.name === name)
    if (existingCategory) {
      // Category already exists, update form value with its ID
      setIsPopoverOpen(false)
      form.setValue('category', existingCategory.id)
      form.setValue('categoryName', existingCategory.name)
      setNewCategory('')
    } else {
      // New category, add it to the list and set the form value to its ID
      const result = await window.electron.ipcRenderer.invoke('addExpenseCategory', name)
      if (result) {
        getExpenseCategories()
        toast('Item added successfully', {
          position: 'top-center',
          duration: 1000
        })
      }
      console.log(result, 'category inserted in db', result)
      setIsPopoverOpen(false)
      setCategories([...categories, { id: result.lastInsertRowid, name }])
      form.setValue('category', result.lastInsertRowid) // Use the new category's ID
      form.setValue('categoryName', name)
      setNewCategory('')
    }
  }

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values, 'submitted values')
    const { title, description, category, amount } = values
    const result = await window.electron.ipcRenderer.invoke(
      'addExpense',
      title,
      category,
      description,
      amount
    )
    if (result) {
      form.reset()
      getExpenses()
      setIsSheetOpen(false)
      toast('Expense added successfully', {
        position: 'top-center',
        duration: 1000
      })
    }
  }

  return (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <SheetTrigger>
        <Button onClick={() => setIsSheetOpen(true)}>Add Expense</Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-[500px]">
        <SheetHeader>
          <SheetTitle>Add Expense</SheetTitle>
          <SheetDescription>
            Add your daily expenses that you do throughout the month, these will be compared against
            the sales
          </SheetDescription>
        </SheetHeader>
        <div className="h-full">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-1">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>title</FormLabel>
                    <FormControl>
                      <Input placeholder="Item Name" {...field} />
                    </FormControl>
                    <FormDescription>This is your menu item name.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input placeholder="Description" {...field} />
                    </FormControl>
                    <FormDescription>This is your menu item description.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="amount" {...field} />
                    </FormControl>
                    <FormDescription>This is your Expense item amount.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                        <PopoverTrigger asChild>
                          <Input
                            placeholder="Select a category"
                            value={form.watch('categoryName')}
                            readOnly
                          />
                        </PopoverTrigger>
                        <PopoverContent className="w-[300px] p-4">
                          <Command>
                            <CommandInput
                              placeholder="Search categories..."
                              value={newCategory}
                              onValueChange={setNewCategory}
                            />
                            <CommandList>
                              <CommandEmpty>
                                {newCategory && (
                                  <Button
                                    variant={'ghost'}
                                    className="w-full"
                                    onClick={() => handleCategoryChange(newCategory)}
                                  >
                                    Add "{newCategory}"
                                  </Button>
                                )}
                                {!newCategory && 'No category found.'}
                              </CommandEmpty>
                              {categories &&
                                categories.map((category) => (
                                  <CommandItem
                                    onSelect={(value) => handleCategoryChange(value)}
                                    className="flex justify-between"
                                  >
                                    <div key={category.id}>{category.name}</div>
                                  </CommandItem>
                                ))}
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </FormControl>
                    <FormDescription>This is your expense item category.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex flex-col gap-4 pt-6">
                {/* <Button variant={'secondary'} type="submit">
                  Save & Add Another
                </Button> */}
                <Button type="submit">Save</Button>
              </div>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  )
}
