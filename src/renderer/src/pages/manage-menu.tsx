import React, { useEffect, useState } from 'react'
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
import { IMenuItem } from 'src/types/sharedTypes'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { EditMenu } from '@renderer/components/edit-sheet'

const formSchema = z.object({
  title: z.string().min(2).max(50),
  description: z.string().min(2).max(50),
  price: z.coerce.number(),
  category: z.coerce.number(),
  short_code: z.string().min(1).max(50)
})

const ManageMenu: React.FC = () => {
  const [menuItems, setMenuItems] = useState<IMenuItem[]>([])
  // const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [filteredData, setFilteredData] = useState<IMenuItem[]>([])

  useEffect(() => {
    getMenuItems()
  }, [])

  const getMenuItems = async () => {
    try {
      setLoading(true)
      const dbItems: IMenuItem[] = await window.electron.ipcRenderer.invoke('getMenuItems')
      setMenuItems(dbItems)
      setFilteredData(dbItems)
      setLoading(false)
    } catch (error) {
      setLoading(false)
      console.log('error::', error)
    }
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      price: 0,
      category: 1,
      short_code: ''
    }
  })

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values)
    const result = await window.electron.ipcRenderer.invoke('addMenuItem', {
      ...values,
      category_id: values.category
    })
    if (result) {
      getMenuItems()
      toast('Item added successfully', {
        position: 'top-center',
        duration: 1000
      })
      // reset form
      form.reset()
    }
    console.log(result)
  }

  const deleteMenuItem = async (id: number) => {
    const result = await window.electron.ipcRenderer.invoke('deleteMenuItem', id)
    if (result) {
      getMenuItems()
      toast('Item deleted successfully', {
        position: 'top-center',
        duration: 1000
      })
    }
  }

  const searchItem = (value: string) => {
    const query = value
    if (query) {
      setFilteredData(
        menuItems.filter((item) => item.title.toLowerCase().includes(query.toLowerCase()))
      )
    } else {
      setFilteredData(menuItems)
    }
  }

  return (
    <div className={`flex w-full flex-row`} style={{ height: 'calc(100% - 1.75rem)' }}>
      <div className="w-1/4 border-r border-border h-full">
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
            <FormField
              control={form.control}
              name="short_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>short code</FormLabel>
                  <FormControl>
                    <Input placeholder="short code" {...field} />
                  </FormControl>
                  <FormDescription>This is shortcode.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Submit</Button>
          </form>
        </Form>
      </div>
      <div className="w-3/4 border-l border-border">
        <div className="overflow-y-scroll h-full">
          <h1 className="pl-5 pt-4 font-bold">Menu Items</h1>
          <div className="px-4 pt-4">
          <Input
                  className="w-full p-6 border border-border rounded-none"
                  type="search"
                  placeholder="Press space to start search or click on the input box"
                  onChange={(e) => searchItem(e.target.value)}
                />
          </div>
          <ul className="p-4">
            {filteredData.map((item) => (
              <li
                key={item.id}
                className="p-2 border-b border-border flex items-center justify-between"
              >
                <span className="font-medium">{item.title}</span>
                <span className="text-sm text-muted-foreground">
                  {' '}
                  Rs:{item.price} - {item.category_id}-{item.short_code ? item.short_code : 'N/A'}
                </span>
                <div className="flex flex-row justify-end space-x-2">
                  <EditMenu getMenuItems={getMenuItems} item={item} />
                  <button onClick={() => deleteMenuItem(item.id)} className="p-1.5 rounded-sm bg-secondary hover:bg-danger-foreground">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default ManageMenu
