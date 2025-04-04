/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { toast } from 'sonner'
import { Button } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/ui/dropdown-menu'
import { useEffect, useRef, useState } from 'react'
import { cn } from './lib/utils'
import {
  ChevronDown,
  Minus,
  Plus,
  PrinterIcon,
  Save,
  Search,
  Trash2
} from 'lucide-react'
import { Input } from './ui/input'
import { DraftBills } from './components/list-drafts-sheet'
import { BilledBills } from './components/list-billed-sheet'
import { AnimatePresence, motion } from 'framer-motion'
import { MobileOrdersSheet } from './components/list-received-orders-sheet'

// import { DiscountDialogButton } from './components/discount-dialog'

interface ListContainerRefType extends HTMLDivElement {
  // Add specific properties if needed
  scrollTop: number
  scrollHeight: number
}

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
  const [invoiceNumber, setInvoiceNumber] = useState<string>('')
  const [billId, setBillId] = useState<number | null>(null)
  const [discountPercentage, setDiscountPercentage] = useState<number>(0)
  const listRef = useRef<ListContainerRefType | null>(null)

  // INFO: search related
  const [searchTerm, setSearchTerm] = useState('')
  // const [searchResults, setSearchResults] = useState<MenuItem[]>([])
  const [animatedRowId, setAnimatedRowId] = useState<number | null>(null)
  const [selectedItem, setSelectedItem] = useState<number | null>(null)
  const [mobileOrders, setMobileOrders] = useState<any[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  // const truncateData = async () => {
  //   await dbService.truncateTables()
  // }

  useEffect(() => {
    // truncateData();
    // addSeedData();
    getMenuItems()
    getCategories()
    generateInvoiceNumber()
    if(inputRef.current){
      inputRef.current.focus()
    }
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

  useEffect((): any => {
    if (animatedRowId) {
      const timeoutId = setTimeout(() => {
        setAnimatedRowId(null)
      }, 300) // Adjust animation duration as needed

      return () => clearTimeout(timeoutId)
    }
  }, [animatedRowId])

  const handleKeyDown = (event: KeyboardEvent): void => {
    if (event.key === ' ' && document.activeElement !== inputRef.current) {
      event.preventDefault() // Prevent default behavior of space key
      setSearchTerm('')
      inputRef.current?.focus() // Focus on the input field
    }

    if (event.ctrlKey && event.code === 'Space') {
      clearBill()
      toast('Bill cleared', {
        position: 'top-center',
        duration: 1000
      })
    }
  }

  const handleSearchInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>): void => {
    if (filteredData.length === 0) return

    console.log(event.key, 'key pressed')

    if (event.key === 'ArrowDown' || event.key === 'Tab') {
      event.preventDefault()
      setSelectedItem((prevSelectedItem) => {
        if (prevSelectedItem === null || prevSelectedItem === filteredData.length - 1) {
          return 0
        } else {
          return prevSelectedItem + 1
        }
      })
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setSelectedItem((prevSelectedItem) => {
        if (prevSelectedItem === null || prevSelectedItem === 0) {
          return filteredData.length - 1
        } else {
          return prevSelectedItem - 1
        }
      })
    } else if (event.key === 'Enter' && selectedItem !== null) {
      console.log('Selected Item:', filteredData[selectedItem])
      addItemToBill(filteredData[selectedItem] as MenuItem, 1)
    }
  }

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const generateInvoiceNumber = async () => {
    // i want an invoice number that is serialized at the end of the number to make it easier to search
    // it should take this format INV-2022-01-01-1000
    const lastInvoiceNumber = await window.electron.ipcRenderer.invoke('getLastInvoiceNumber')
    setInvoiceNumber(`${Number(lastInvoiceNumber) + 1}`)
  }

  const getMenuItems = async () => {
    try {
      const dbItems: MenuItem[] = await window.electron.ipcRenderer.invoke('getMenuItems')
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

  const handleSearch = (e: any): void => {
    const term = e.target.value
    setSearchTerm(term)

    // Filter the menu items based on the search term
    const filteredResults = menuItems
      .filter((item) => {
        const lowerTerm = term.toLowerCase()
        const hasShortCode = item.short_code?.toLowerCase() === lowerTerm
        const includesTitle = item.title.toLowerCase().includes(lowerTerm)
        return hasShortCode || includesTitle
      })
      .sort((a, b) => {
        const lowerTerm = term.toLowerCase()
        const aHasShortCode = a.short_code?.toLowerCase() === lowerTerm
        const bHasShortCode = b.short_code?.toLowerCase() === lowerTerm
        if (aHasShortCode && !bHasShortCode) return -1
        if (!aHasShortCode && bHasShortCode) return 1
        return 0
      })

    setFilteredData(filteredResults)
    setSelectedItem(0)
  }

  const filterMenuItems = (categoryId: number) => {
    if (categoryId === -1) return setFilteredData(menuItems)
    const filtered = menuItems.filter((item) => item.category_id === categoryId)
    setFilteredData(filtered)
  }

  const scrollToBottom = () => {
    if (listRef.current) {
      listRef.current?.scrollTo({
        top: listRef.current.scrollHeight - 50,
        behavior: 'smooth'
      })
    }
  }

  const addItemToBill = (item: MenuItem, quantity: number) => {
    // if item already exists in bill, increment the quantity
    const existingItem = billItems.find((billItem) => billItem.item.id === item.id)
    if (existingItem) {
      existingItem.quantity += quantity
      setAnimatedRowId(existingItem.item.id) // for animation
      setSearchTerm('') // clear input
      return setBillItems([...billItems])
    }
    const billItem: BillItem = {
      quantity: quantity,
      item: item
    }
    setBillItems([...billItems, billItem])
    scrollToBottom()
    setAnimatedRowId(billItem.item.id) // for animation
    setSearchTerm('') // clear input
  }

  const saveBill = async () => {
    try {
      console.log('bill items::', billItems)

      if (billId) {
        const result = await window.electron.ipcRenderer.invoke(
          'updateBill',
          billItems,
          TotalAmount,
          invoiceNumber,
          billId
        )
        console.log(result, 'updated bill')
        toast('Bill updated successfully', {
          position: 'top-center',
          duration: 1000
        })
        clearBill()
      } else {
        // save bill
        setBillId(null)
        const result = await window.electron.ipcRenderer.invoke(
          'saveBill',
          billItems,
          TotalAmount,
          invoiceNumber
        )
        console.log(result, 'saved bill')
        toast('Bill saved successfully', {
          position: 'top-center',
          duration: 1000
        })
        clearBill()
      }
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
    clearBill()
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
      let result: any[] = await window.electron.ipcRenderer.invoke('getBillsWithBillItems')
      console.log(result, 'bills with bill items')
      if (result) {
        result = result.reverse()
        setBilledBills(result)
      } else {
        setBilledBills([])
      }
    } catch (error) {
      console.log('error::', error)
    }
  }

  const getMobileOrders = async () => {
    try {
      let result: any[] = await window.electron.ipcRenderer.invoke('getMobileOrders')
      console.log(result, 'mobile orders')
      if (result) {
        setMobileOrders(result)
      } else {
        setMobileOrders([])
      }
    } catch (error) {
      console.log('error fetching mobile orders:', error)
    }
  }

  const handleAddToBilling = async (order: any) => {
    const newBillItems = order.items.map((item: any) => ({
      item: {
        id: item.menu_item_id,
        title: item.title,
        price: item.price
      },
      quantity: item.quantity
    }))

    setBillItems([...billItems, ...newBillItems])

    // Generate a new invoice number
    const newInvoiceNumber = await window.electron.ipcRenderer.invoke('getLastInvoiceNumber')
    const nextInvoiceNumber = String(Number(newInvoiceNumber) + 1)
    setInvoiceNumber(nextInvoiceNumber)

    // Update the order status and set the new invoice number
    window.electron.ipcRenderer.invoke('updateOrderStatus', order.id, true, true, nextInvoiceNumber)
      .then(() => {
        // Refresh the mobile orders list
        getMobileOrders()
        toast.success(`Order #${order.order_number} added to billing with new invoice #${nextInvoiceNumber}`)
      })
      .catch((error) => {
        console.error('Failed to update order status:', error)
        toast.error('Failed to add order to billing')
      })
  }


  const restoreBill = (bill: Bill) => {
    console.log(bill, ':::::::::bill to restore')
    setInvoiceNumber(bill.invoice_number)
    setBillItems(bill.items)
    if (bill.id) {
      setBillId(bill.id)
    }
  }

  const printBill = async () => {
    try {
      console.log('Printing bill...', billItems, TotalAmount)
      const billPrinted = await window.electron.ipcRenderer.invoke('print', billItems, TotalAmount)
      saveBill()
      console.log(billPrinted, 'bill printed')
      // printIpcHandle(billItems)
    } catch (error: any) {
      console.log('Error printing bill:', error)
      toast('error printing bill', error)
    }
  }

  const clearBill = () => {
    setBillItems([])
    setBillId(null)
    generateInvoiceNumber()
  }

  const addDiscount = () => {
    // discount should be in percentage
    // setDiscount((discount / 100) * TotalAmount);
    setDiscountPercentage(10)
  }

  return (
    <AnimatePresence mode="wait" initial={true}>
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 10, opacity: 0 }}
        className={`flex w-full flex-row`}
        style={{ height: 'calc(100% - 1.75rem)' }}
      >
        <div className="h-full w-1/2 min-w-96 px-2 py-2">
          <div className="flex h-full flex-col">
            {/* input */}
            <div className="flex h-12 w-full flex-col">
              <div className="relative ml-auto flex-1 md:grow-0 w-full">
                <Search className="absolute left-2.5 top-4 h-4 w-4 text-primary" />
                <Input
                  className="w-full px-8 py-6 border border-border rounded-none"
                  type="search"
                  placeholder="Press space to start search or click on the input box"
                  value={searchTerm}
                  onChange={handleSearch}
                  onKeyDown={handleSearchInputKeyDown}
                  ref={inputRef}
                />
              </div>
              {/* <SearchComponent data={filteredData} addItemToBill={addItemToBill} /> */}
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
                  className={cn('hover:bg-accent p-2 text-xs hover:cursor-pointer', {
                    'bg-accent': selectedCategory === -1 || !selectedCategory
                  })}
                >
                  {'ALL'}
                </div>
                {categories.map((category) => (
                  <div
                    onClick={() => {
                      setSelectedCategory(category.id)
                      filterMenuItems(category.id)
                    }}
                    className={cn('hover:bg-accent hover:cursor-pointer p-2 text-xs', {
                      'border-border bg-accent border-y': selectedCategory === category.id
                    })}
                    key={category.id}
                  >
                    {category.name.toLocaleUpperCase()}
                  </div>
                ))}
              </div>
              {/* menu items */}
              <div className="flex-1 cursor-pointer select-none overflow-y-auto p-1 text-xs">
                <div className="grid grid-cols-3 gap-2">
                  {filteredData.map((item, index) => (
                    <div
                      onClick={() => {
                        addItemToBill(item, 1)
                        if (inputRef.current) {
                          inputRef.current?.focus()
                        }
                      }}
                      className={`flex flex-col justify-between hover:dark:bg-background hover:bg-gray-500 hover:dark:text-primary-foreground hover:text-card p-2 bg-muted border border-1 h-20 ${
                        index === selectedItem
                          ? 'bg-primary dark:text-primary-foreground text-card'
                          : ''
                      }`}
                      key={item.id}
                    >
                      <div className="text-left">{item.title.toUpperCase()}</div>
                      {/* <Separator orientation="horizontal" /> */}
                      <div className="flex flex-row justify-between">
                        <div className="text-xs">{item.short_code}</div>

                        <div className="font-bold">
                          {' Rs.'}
                          {item.price}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="h-full w-1/2 min-w-96 py-2 pr-2">
          <div className="border-border flex h-full flex-1 flex-col overflow-y-auto border">
            <div className="border-border flex flex-row justify-between border-b py-1 px-2">
              <div className="text-base flex flex-col items-center justify-center">
                <div className="">
                  Invoice No:
                  <p className="font-bold float-right ml-1">{invoiceNumber}</p>
                </div>

                {/* <div className="text-base font-bold mr-2">Total: Rs. {TotalAmount}</div> */}
              </div>
              <div className="flex flex-row items-center">
                <BilledBills
                  onClickBills={() => getBillsWithBillItems()}
                  billedBills={billedBills}
                  restoreBill={restoreBill}
                />
                <DraftBills
                  onClickDrafts={() => getDrafts()}
                  draftBills={draftBills}
                  restoreDraft={restoreDraft}
                  deleteDraft={deleteDraft}
                />
                <MobileOrdersSheet
                  onClickMobileOrders={getMobileOrders}
                  mobileOrders={mobileOrders}
                  onAddToBilling={handleAddToBilling}
                />
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <Button className="pr-2" variant={'outline'} size={'sm'}>
                      Actions <ChevronDown />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => addDiscount()}>Discount</DropdownMenuItem>
                    {/* <DropdownMenuItem>Billing</DropdownMenuItem> */}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <div className="flex flex-1 flex-col overflow-y-scroll p-4 pb-12" ref={listRef}>
              <table className="bg-card table-auto">
                <thead className="bg-muted">
                  <tr className="text-sm">
                    <th className="px-4 py-1 text-left font-semibold">Item</th>
                    <th className="px-4 py-1 font-semibold">Price</th>
                    <th className="px-4 py-1 font-semibold">Qty</th>
                    <th className="px-2 py-1 font-semibold">Amount</th>
                    <th className="px-4 py-1 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {billItems.map((billItem) => (
                    <tr
                      className={cn(
                        'border-border select-none border-y',
                        billItem.item.id === animatedRowId ? 'bg-secondary' : ''
                      )}
                      key={billItem.item.id}
                    >
                      <td
                        className="px-4 py-1 text-sm"
                        // onClick={() => openOptions(billItem.item)}
                      >
                        {billItem.item.title}
                      </td>
                      {/* <td className="px-4 py-1 text-center">{billItem.item.price}</td> */}
                      <td className="px-4 py-1 text-center">
                        <Input
                          className="w-16 rounded-sm p-1 text-center"
                          style={{
                            WebkitAppearance: 'none',
                            margin: 0,
                            MozAppearance: 'textfield'
                          }}
                          type="number"
                          min={0}
                          inputMode="numeric"
                          value={billItem.item.price}
                          onChange={(e) => {
                            const newPrice = parseFloat(e.target.value)
                            const updatedBillItems = billItems.map((item) => {
                              if (item.item.id === billItem.item.id) {
                                return {
                                  ...item,
                                  item: {
                                    ...item.item,
                                    price: newPrice
                                  }
                                }
                              }
                              return item
                            })
                            setBillItems(updatedBillItems)
                          }}
                        />
                      </td>
                      <td className="flex flex-row px-2 py-1 text-center">
                        <Button
                          variant="secondary"
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
                          variant="secondary"
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
            <div className="border-t bg-secondary">
              <div className="flex flex-row justify-end p-2">
                <table>
                  {discountPercentage > 0 && (
                    <tr>
                      <td className="text-muted-foreground">Discount:</td>
                      <td className="text-right">{discountPercentage}%</td>
                    </tr>
                  )}
                  <tr>
                    <td className="text-muted-foreground">Total:</td>
                    <td className="text-right">Rs.{TotalAmount}</td>
                  </tr>
                  {discountPercentage > 0 && (
                    <tr>
                      <td className="text-muted-foreground">Total after discount: </td>

                      <td className="text-right">
                        Rs.{(TotalAmount * ((100 - discountPercentage) / 100)).toFixed(2)}
                      </td>
                    </tr>
                  )}
                </table>
              </div>

              <div className="flex flex-row items-center justify-between px-2 pb-2">
                <Button
                  disabled={billItems.length === 0}
                  variant={'default'}
                  onClick={() => clearBill()}
                >
                  {/* <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100 mr-2">
                <span className="text-xs">ctl</span>+space
              </kbd> */}
                  Clear Bill
                </Button>
                <Button
                  disabled={billItems.length === 0 || billId !== null}
                  variant={'default'}
                  onClick={() => saveDraft()}
                >
                  Hold
                </Button>
                {/* <DiscountDialogButton /> */}
                <Button
                  disabled={billItems.length === 0}
                  variant={'default'}
                  onClick={() => saveBill()}
                >
                  <Save size={16} className="mr-1" /> {billId ? 'Update' : 'E-bill'}
                </Button>
                <Button
                  disabled={billItems.length === 0}
                  variant={'default'}
                  onClick={() => printBill()}
                >
                  <PrinterIcon size={16} className="mr-1" />
                  Print
                  {/* <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100 ml-2">
                <span className="text-xs">ctl</span>P
              </kbd> */}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export default App
