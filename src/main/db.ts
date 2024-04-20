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
