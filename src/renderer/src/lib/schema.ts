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
  name: string
  category_id: number
  price: number
}

interface BillItem {
  quantity: number
  item: MenuItem
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface Bill {
  id: number
  total: number
  date: string
  items: BillItem[]
}
