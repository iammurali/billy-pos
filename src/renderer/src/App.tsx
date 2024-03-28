/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { toast } from 'sonner'
import { Button } from './ui/button'
import { useEffect, useState } from 'react'
import SearchComponent from './components/search-component'
import { cn } from './lib/utils'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { Input } from './ui/input'

function App(): JSX.Element {
  const printIpcHandle = (): void => window.electron.ipcRenderer.send('print')

  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [filteredData, setFilteredData] = useState<MenuItem[]>([])
  const [selectedCategory, setSelectedCategory] = useState<number>()
  const [billItems, setBillItems] = useState<BillItem[]>([])
  const [TotalAmount, setTotalAmount] = useState<number>(0.0)

  // const truncateData = async () => {
  //   await dbService.truncateTables()
  // }

  useEffect(() => {
    // truncateData();
    // addSeedData();
    getMenuItems()
    getCategories()
    // getBillsWithBillItems()
  }, [])

  useEffect(() => {
    let total = 0
    billItems.forEach((billItem) => {
      total += billItem.item.price * billItem.quantity
    })
    total = parseFloat(total.toFixed(2))
    setTotalAmount(total)
  }, [billItems])

  const getMenuItems = async () => {
    try {
      const result = [
        {
          id: 1,
          name: 'Tea',
          category_id: 1,
          price: 10
        },
        {
          id: 2,
          name: 'Coffee',
          category_id: 1,
          price: 15
        },
        {
          id: 3,
          name: 'Iced Tea',
          category_id: 1,
          price: 20
        },
        {
          id: 4,
          name: 'Smoothie',
          category_id: 1,
          price: 25
        },
        {
          id: 5,
          name: 'Hot Chocolate',
          category_id: 1,
          price: 30
        },
        {
          id: 6,
          name: 'Milkshake',
          category_id: 1,
          price: 35
        },
        {
          id: 7,
          name: 'Soda',
          category_id: 1,
          price: 40
        },
        {
          id: 8,
          name: 'Lemonade',
          category_id: 1,
          price: 45
        },
        {
          id: 9,
          name: 'Fruit Juice',
          category_id: 1,
          price: 50
        },
        {
          id: 10,
          name: 'Water',
          category_id: 1,
          price: 55
        }
      ]
      setMenuItems(result)
      setFilteredData(result)
    } catch (error) {
      console.log('error::', error)
    }
  }
  const getCategories = async () => {
    try {
      const result: Category[] = [
        {
          id: 1,
          name: 'Beverages'
        },
        {
          id: 2,
          name: 'Snacks'
        },
        {
          id: 3,
          name: 'Toys'
        },
        {
          id: 4,
          name: 'Juice'
        },
        {
          id: 5,
          name: 'Fried'
        }
      ]
      console.log('categories::::', result)
      setCategories(result)
    } catch (error) {
      console.log('error::', error)
    }
  }

  const filterMenuItems = (categoryId: number) => {
    if (categoryId === -1) return setFilteredData(menuItems)
    const filtered = menuItems.filter((item) => item.category_id === categoryId)
    setFilteredData(filtered)
  }

  const addItemToBill = (item: MenuItem) => {
    // if item already exists in bill, increment the quantity
    const existingItem = billItems.find((billItem) => billItem.item.id === item.id)
    if (existingItem) {
      existingItem.quantity += 1
      return setBillItems([...billItems])
    }
    const billItem: BillItem = {
      quantity: 1,
      item: item
    }
    setBillItems([...billItems, billItem])
  }

  const saveBill = async () => {
    try {
      // const insertBill = await dbService.insertBill([TotalAmount, new Date()])
      // console.log('INSERTED BILL:', insertBill)

      // const billId = insertBill.lastInsertId
      // console.log('BILL ID:', billId)
      // insert billItems for the bill
      // await dbService.bulkInsertBillItems(billItems, billId)
      setBillItems([])
      toast('Bill saved successfully', {
        position: 'top-center',
        duration: 1000
      })
    } catch (error) {
      console.error('Error saving bill:', error)
    }
  }

  const printBill = async () => {
    console.log('Printing bill...')
    try {
      printIpcHandle()
    } catch (error: any) {
      console.log('Error printing bill:', error)
      toast('error printing bill', error)
    }
  }

  const clearBill = () => {
    setBillItems([])
  }

  return (
      <div className={`flex w-full flex-row`} style={{ height: 'calc(100% - 1.75rem)' }}>
        <div className="h-full w-1/2 min-w-96 px-2 py-2">
          <div className="flex h-full flex-col">
            {/* input */}
            <div className="flex h-12 w-full flex-col">
              {/* <Input
                  className="w-full p-6 border border-border rounded-none"
                  type="search"
                  placeholder="Press space to start search or click on the input box"
                  onChange={(e) => searchItem(e.target.value)}
                /> */}
              <SearchComponent data={filteredData} />
            </div>
            {/* cat and menu container */}
            <div
              className="border-border mt-2 flex flex-row border"
              style={{ height: 'calc(100% - 3.5rem)' }}
            >
              {/* category */}
              <div className="border-border min-w-28 border-r p-1">
                <div
                  onClick={() => {
                    setSelectedCategory(-1)
                    filterMenuItems(-1)
                  }}
                  className={cn('hover:bg-accent p-2', {
                    'bg-accent': selectedCategory === -1 || !selectedCategory
                  })}
                >
                  {'All'}
                </div>
                {categories.map((category) => (
                  <div
                    onClick={() => {
                      setSelectedCategory(category.id)
                      filterMenuItems(category.id)
                    }}
                    className={cn('hover:bg-accent  p-2', {
                      'border-border bg-accent border-y': selectedCategory === category.id
                    })}
                    key={category.id}
                  >
                    {category.name.toLocaleUpperCase()}
                  </div>
                ))}
              </div>
              {/* menu items */}
              <div className="flex-1 cursor-pointer select-none overflow-y-auto p-1">
                {filteredData.map((item) => (
                  <div
                    onClick={() => addItemToBill(item)}
                    className="hover:bg-accent p-2"
                    key={item.id}
                  >
                    {item.name} ::
                    {' Rs.'}
                    {item.price}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="h-full w-1/2 min-w-96 py-2 pr-2">
          <div className="border-border flex h-full flex-1 flex-col overflow-y-auto border">
            <div className="border-border flex flex-row justify-between border-b p-4">
              <div className="text-xl">Bill</div>
              <div className="text-xl">Total: Rs. {TotalAmount}</div>
            </div>
            <div className="flex flex-1 flex-col overflow-y-scroll p-4">
              <table className="bg-card table-auto">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-1 text-left font-semibold">Item</th>
                    <th className="px-4 py-1 font-semibold">Qty</th>
                    <th className="px-4 py-1 font-semibold">Price</th>
                    <th className="px-2 py-1 font-semibold">Amount</th>
                    <th className="px-4 py-1 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {billItems.map((billItem) => (
                    <tr className="border-border select-none border-y" key={billItem.item.id}>
                      <td className="px-4 py-1">{billItem.item.name}</td>
                      <td className="flex flex-row px-2 py-1 text-center">
                        <Button
                          variant="outline"
                          size="icon"
                          className="mr-1"
                          // className="px-2 bg-background rounded-sm border border-border-500"
                          onClick={() => {
                            const newQuantity = billItem.quantity - 1
                            if (newQuantity < 1) return
                            const updatedBillItems = billItems.map((item) => {
                              if (item.item.id === billItem.item.id) {
                                return { ...item, quantity: newQuantity }
                              }
                              return item
                            })
                            setBillItems(updatedBillItems)
                          }}
                        >
                          <Minus />
                        </Button>
                        <Input
                          className="borsder border-border w-8 rounded-sm p-1 text-center"
                          style={{
                            WebkitAppearance: 'none',
                            margin: 0,
                            MozAppearance: 'textfield'
                          }}
                          type="number"
                          value={billItem.quantity}
                          onChange={(e) => {
                            const newQuantity = parseInt(e.target.value)
                            const updatedBillItems = billItems.map((item) => {
                              if (item.item.id === billItem.item.id) {
                                return { ...item, quantity: newQuantity }
                              }
                              return item
                            })
                            setBillItems(updatedBillItems)
                          }}
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          className="ml-1"
                          // className="px-2 bg-background rounded-sm border border-border-500"
                          onClick={() => {
                            const newQuantity = billItem.quantity + 1
                            const updatedBillItems = billItems.map((item) => {
                              if (item.item.id === billItem.item.id) {
                                return { ...item, quantity: newQuantity }
                              }
                              return item
                            })
                            setBillItems(updatedBillItems)
                          }}
                        >
                          <Plus />
                        </Button>
                      </td>
                      <td className="px-4 py-1 text-center">{billItem.item.price}</td>
                      <td className="px-4 py-1 text-center">
                        {billItem.quantity * billItem.item.price}
                      </td>
                      <td className="px-4 py-1 text-center">
                        <Button
                          variant="outline"
                          size="icon"
                          // className="bg-background p-2 rounded-sm"
                          onClick={() => {
                            const newBillItems = billItems.filter(
                              (item) => item.item.id !== billItem.item.id
                            )
                            setBillItems(newBillItems)
                          }}
                        >
                          <Trash2 />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="border-border flex flex-row items-center justify-between border-t p-4">
              <div>Sub Total</div>
              <div>Rs. {TotalAmount}</div>
              <Button variant={'default'} onClick={() => clearBill()}>
                Clear Bill
              </Button>
              <Button variant={'default'} onClick={() => saveBill()}>
                Save Bill
              </Button>
              <Button variant={'default'} onClick={() => printBill()}>
                Print Bill
              </Button>
            </div>
          </div>
        </div>
      </div>
  )
}

export default App
