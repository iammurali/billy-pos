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

const formSchema = z.object({
  id: z.any(),
  title: z.string().min(2).max(50),
  description: z.string().min(2).max(50),
  amount: z.coerce.number({message: 'Amount is required'}),
  category: z.coerce.number(),
  short_code: z.string().min(1).max(50)
})

export function AddExpense() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
    }
  })

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values)

  }

  return (
    <Sheet >
      <SheetTrigger>
        <Button>Add Expense</Button>
      </SheetTrigger>
      <SheetContent className='sm:max-w-[500px]'>
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
                      <Input type="number" placeholder="Category" {...field} />
                    </FormControl>
                    <FormDescription>This is your expense item category.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className='flex flex-col gap-4 pt-6'>
              <Button variant={'secondary'} type="submit">Save & Add Another</Button>
              <Button type="submit">Save</Button>
              </div>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  )
}

// onClick={() => editMenuItem(item)}
