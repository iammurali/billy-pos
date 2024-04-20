import Database from 'better-sqlite3'
import { IMenuItem } from '../types/sharedTypes'
import path from 'path'
import { app } from 'electron/main'

console.log(process.resourcesPath, 'resourcepath', app.getAppPath())

const dbPath =
  process.env.NODE_ENV === 'development'
    ? './coffeehouse.db'
    : path.join(process.resourcesPath, 'data/coffeehouse.db')

console.log(dbPath, 'DB PATH:::::::')

const db = new Database(dbPath, { fileMustExist: true })

db.pragma('journal_mode = WAL')
let i = 0

export const getMenuItems = (): IMenuItem[] => {
  try {
    i += 1
    // console.log('IPC method called', i)
    const query = `SELECT * FROM menu_item WHERE isActive = '${'true'}'`
    const readQuery = db.prepare(query)
    const rowList = readQuery.all() as IMenuItem[]
    console.log(rowList[0])
    return rowList
  } catch (err) {
    console.error(err, 'Get all menu items::')
    throw err
  }
}

export const addMenuItem = async (menuItem: IMenuItem) => {
  try {
    const insertQuery = db.prepare(
      `INSERT INTO menu_item (title, description, category_id, price, isActive, created_at, updatedAt, short_code) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    const result = insertQuery.run(
      menuItem.title,
      menuItem.description,
      menuItem.category_id,
      menuItem.price,
      'true',
      menuItem.created_at,
      menuItem.updatedAt,
      menuItem.short_code
    )
    return result
  } catch (err) {
    console.error(err, 'Add menu item::')
    throw err
  }
}

export const deleteMenuItem = async (id: number) => {
  // change isActive to false
  const updateQuery = db.prepare(`UPDATE menu_item SET isActive = 'false' WHERE id = ?`)
  const result = updateQuery.run(id)
  return result
}

export const updateMenuItem = async (menuItem: IMenuItem) => {
  try {
    const updateQuery = db.prepare(
      `UPDATE menu_item SET title = ?, description = ?, category_id = ?, price = ?, short_code = ? WHERE id = ?`
    )
    const result = updateQuery.run(
      menuItem.title,
      menuItem.description,
      menuItem.category_id,
      menuItem.price,
      menuItem.short_code,
      menuItem.id
    )
    return result
  } catch (err) {
    console.error(err, 'Update menu item::')
    throw err
  }
}

export const saveBill = async (billItems: BillItem[], totalAmount: number) => {
  try {
    console.log(billItems, 'bill items')
    const insertQuery = db.prepare(
      `INSERT INTO bills (total_amount) VALUES (?)`
    )
    const result = insertQuery.run(totalAmount)
    const billId = result.lastInsertRowid
    console.log(billId, 'bill id')

    billItems.forEach((billItem) => {
      const insertQuery = db.prepare(
        `INSERT INTO bill_items (bill_id, menu_item_id, quantity, amount) VALUES (?, ?, ?, ?)`
      )
      const result = insertQuery.run(billId, billItem.item.id, billItem.quantity, billItem.item.price*billItem.quantity)
      console.log(result, 'bill item inserted')
    })
    return result

    
  } catch (error) {
    console.log(error)
    throw error
  }
}

const converFlatListToBillInterface = (rowList: any[]) => {
  // convert flat list to bill interface each object in list will have single bill_id and multiple bill_items
  const billItemsMap: { [key: number]: BillItem[] } = {}
  rowList.forEach((billItem) => {
    if (!billItemsMap[billItem.bill_id]) {
      billItemsMap[billItem.bill_id] = []
    }
    billItemsMap[billItem.bill_id].push(billItem)
  })

  const bills: Bill[] = []
  Object.keys(billItemsMap).forEach((billId) => {
    const billItems = billItemsMap[billId]
    const bill: Bill = {
      id: Number(billId),
      total: billItems.reduce((acc, billItem) => acc + billItem.amount, 0),
      items: billItems,
      date: billItems[0].created_at
    }
    bills.push(bill)
  })

  console.log(bills, 'bills')
  return bills
  
  
}
export const getBillsWithBillItems = async () => {
  try {
    // get all bills with bill items i only want the last 10 bills
    
    const query = `SELECT * FROM bills JOIN bill_items ON bills.id = bill_items.bill_id JOIN menu_item ON bill_items.menu_item_id = menu_item.id`
    const readQuery = db.prepare(query)
    const rowList = readQuery.all()
    const billItems = converFlatListToBillInterface(rowList)
    console.log(billItems, 'bills with bill items')
    return billItems
  } catch (err) {
    console.error(err, 'Get all bills::')
    throw err
  }
}
