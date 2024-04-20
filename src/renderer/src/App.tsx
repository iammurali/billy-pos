/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { toast } from 'sonner'
import { Button } from './ui/button'
import { useEffect, useState } from 'react'
import SearchComponent from './components/search-component'
import { cn } from './lib/utils'
import { Minus, Plus, Printer, Trash2 } from 'lucide-react'
import { Input } from './ui/input'
import { IMenuItem } from 'src/types/sharedTypes'
import { DraftBills } from './components/list-drafts-sheet'
import { BilledBills } from './components/list-billed-sheet'

function App(): JSX.Element {
  // const printIpcHandle = (): void => window.electron.ipcRenderer.invoke('print')
  // const getMenuItemsIpcHandle = (): IMenuItem[] => window.electron.ipcRenderer.send('getMenuItems')

  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [filteredData, setFilteredData] = useState<MenuItem[]>([])
  const [selectedCategory, setSelectedCategory] = useState<number>()
  const [billItems, setBillItems] = useState<BillItem[]>([])
  const [TotalAmount, setTotalAmount] = useState<number>(0.0)
  const [draftBills, setDraftBills] = useState<DraftBill[]>([])
  const [billedBills, setBilledBills] = useState<any[]>([])

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
      const dbItems: IMenuItem[] = await window.electron.ipcRenderer.invoke('getMenuItems')
      console.log(dbItems, 'menuitems')
      setMenuItems(dbItems)
      setFilteredData(dbItems)
      const getDebugData = await window.electron.ipcRenderer.invoke('debuggermethod')
      console.log('debug data', getDebugData)
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
      console.log('bill items::', billItems)
      const result = await window.electron.ipcRenderer.invoke('saveBill', billItems, TotalAmount)
      console.log(result, 'saved bill')
      toast('Bill saved successfully', {
        position: 'top-center',
        duration: 1000
      })
      setBillItems([])
    } catch (error) {
      console.error('Error saving bill:', error)
    }
  }

  const saveDraft = async () => {
    const draftBills = localStorage.getItem('draftBills')
    if (draftBills) {
      const parsedDraftBills = JSON.parse(draftBills)
      parsedDraftBills.push({ billItems, billedDateandTime: new Date(), totalAmount: TotalAmount })
      localStorage.setItem('draftBills', JSON.stringify(parsedDraftBills))
      toast('Bill saved as draft', {
        position: 'top-center',
        duration: 1000
      })
    } else {
      localStorage.setItem(
        'draftBills',
        JSON.stringify([
          { billItems, billedDateandTime: new Date().toISOString(), totalAmount: TotalAmount }
        ])
      )
      toast('Bill saved as draft', {
        position: 'top-center',
        duration: 1000
      })
    }
    setBillItems([])
  }

  const restoreDraft = (draftBill: DraftBill) => {
    console.log(draftBill)
    setBillItems(draftBill.billItems)
  }

  const deleteDraft = (draftBill: DraftBill) => {
    console.log(draftBill)
    const draftBills = localStorage.getItem('draftBills')
    console.log('og draft', draftBills)
    if (draftBills) {
      const parsedDraftBills = JSON.parse(draftBills)
      const filteredDraftBills = parsedDraftBills.filter(
        (bill) => bill.billedDateandTime !== draftBill.billedDateandTime
      )
      console.log(filteredDraftBills, 'filtered draft bills')
      localStorage.setItem('draftBills', JSON.stringify(filteredDraftBills))
      getDrafts()
      toast('Bill deleted from draft', {
        position: 'top-center',
        duration: 1000
      })
    } else {
      // error
      console.log('No drafts found')
    }
  }

  const getDrafts = () => {
    const draftBills = localStorage.getItem('draftBills')
    if (draftBills) {
      const parsedDraftBills = JSON.parse(draftBills)
      console.log(parsedDraftBills, 'draft bills')
      // setBillItems(parsedDraftBills)
      setDraftBills(parsedDraftBills.reverse())
    } else {
      setDraftBills([])
    }
  }

  const getBillsWithBillItems = async () => {
    try {
      const result = await window.electron.ipcRenderer.invoke('getBillsWithBillItems')
      console.log(result, 'bills with bill items')
      if (result) {
        setBilledBills(result)
      } else {
        setBilledBills([])
      }
    } catch (error) {
      console.log('error::', error)
    }
  }

  const printBill = async () => {
    try {
      saveBill()
      console.log('Printing bill...', billItems, TotalAmount)
      const billPrinted = await window.electron.ipcRenderer.invoke('print', billItems, TotalAmount)
      console.log(billPrinted, 'bill printed')
      // printIpcHandle(billItems)
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
            <SearchComponent data={filteredData} addItemToBill={addItemToBill} />
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
                  {item.title} ::
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
            <div className="flex flex-row items-center">
              {/* <Button className='mr-2' variant={'outline'} size="sm" onClick={() => getDrafts()}>
              Bills
            </Button> */}
              <BilledBills onClickBills={() => getBillsWithBillItems()} billedBills={billedBills} />
              <DraftBills
                onClickDrafts={() => getDrafts()}
                draftBills={draftBills}
                restoreDraft={restoreDraft}
                deleteDraft={deleteDraft}
              />
              <div className="text-xl">Total: Rs. {TotalAmount}</div>
            </div>
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
                    <td className="px-4 py-1">{billItem.item.title}</td>
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
                        className="borsder border-border w-11 rounded-sm p-1 text-center"
                        style={{
                          WebkitAppearance: 'none',
                          margin: 0,
                          MozAppearance: 'textfield'
                        }}
                        type="tel"
                        inputMode="numeric"
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
            <Button
              disabled={billItems.length === 0}
              variant={'default'}
              onClick={() => clearBill()}
            >
              <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100 mr-2">
                <span className="text-xs">ctl</span>+space
              </kbd>
              Clear Bill
            </Button>
            <Button
              disabled={billItems.length === 0}
              variant={'default'}
              onClick={() => saveDraft()}
            >
              Save Draft
            </Button>
            <Button
              disabled={billItems.length === 0}
              variant={'default'}
              onClick={() => saveBill()}
            >
              E Bill
            </Button>
            <Button
              disabled={billItems.length === 0}
              variant={'default'}
              onClick={() => printBill()}
            >
              Print Bill{' '}
              <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100 ml-2">
                <span className="text-xs">ctl</span>P
              </kbd>              
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
