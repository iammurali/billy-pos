/* eslint-disable @typescript-eslint/no-unused-vars */
interface User {
  id: number
  name: string
}

interface Category {
  id: number
  name: string
}

interface MenuItem {
  id: number
  title: string
  category_id: number
  price: number
  description?: string
  short_code?: string
}

interface BillItem {
  quantity: number
  item: MenuItem
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface Bill {
  id?: number
  invoice_number: string
  total?: number
  date?: string
  items: BillItem[]
}

interface DraftBill {
  billedDateandTime: string
  billItems: BillItem[]
}