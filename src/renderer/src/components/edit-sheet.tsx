import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@/ui/sheet'
import { PencilIcon } from 'lucide-react'
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
  price: z.coerce.number(),
  category: z.coerce.number()
})

export function EditMenu({
  item,
  getMenuItems
}: {
  item: MenuItem
  getMenuItems: () => void
}) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: item.id,
      title: item.title,
      description: item.description,
      price: item.price,
      category: item.category_id
    }
  })

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values)
    const result = await window.electron.ipcRenderer.invoke('updateMenuItem', {
      ...values,
      category_id: values.category
    })
    console.log(result)
    if (result) {
      getMenuItems()
      toast('Item updated successfully', {
        position: 'top-center',
        duration: 1000,
        style: {
          background: 'green',
          color: 'white'
        }
      })
      // reset form
      //   form.reset()
    }
    console.log(result)
  }

  return (
    <Sheet>
      <SheetTrigger>
        <button className="p-1.5 rounded-sm bg-secondary hover:bg-primary-foreground">
          <PencilIcon className="h-4 w-4" />
        </button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit menu item</SheetTitle>
          <SheetDescription>
            This action cannot be undone. This will permanently delete your account and remove your
            data from our servers.
          </SheetDescription>
        </SheetHeader>
        <div className="h-full">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-1 p-8">
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
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Price" {...field} />
                    </FormControl>
                    <FormDescription>This is your menu item price.</FormDescription>
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
                    <FormDescription>This is your menu item category.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">Update</Button>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  )
}

// onClick={() => editMenuItem(item)}
