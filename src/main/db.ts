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

export const saveBill = async (
  billItems: BillItem[],
  totalAmount: number,
  invoiceNumber: string
) => {
  try {
    console.log(billItems, 'bill items')
    const insertQuery = db.prepare(`INSERT INTO bills (total_amount, invoice_number) VALUES (?, ?)`)
    const result = insertQuery.run(totalAmount, invoiceNumber)
    const billId = result.lastInsertRowid
    console.log(billId, 'bill id')

    billItems.forEach((billItem) => {
      const insertQuery = db.prepare(
        `INSERT INTO bill_items (bill_id, menu_item_id, quantity, amount) VALUES (?, ?, ?, ?)`
      )
      const result = insertQuery.run(
        billId,
        billItem.item.id,
        billItem.quantity,
        billItem.item.price * billItem.quantity
      )
      console.log(result, 'bill item inserted')
    })
    return result
  } catch (error) {
    console.log(error)
    throw error
  }
}

export const updateBill = (
  billItems: BillItem[],
  totalAmount: number,
  invoiceNumber: string,
  billId: number
) => {
  try {
    const updateQuery = db.prepare(
      `UPDATE bills SET total_amount = ?, invoice_number = ? WHERE id = ?`
    )
    const result = updateQuery.run(totalAmount, invoiceNumber, billId)
    console.log(result, 'Update bill::')
    // delete all bill items for this bill
    const deleteQuery = db.prepare(`DELETE FROM bill_items WHERE bill_id = ?`)
    const deleteResult = deleteQuery.run(billId)
    console.log(deleteResult, 'deleted bill items')
    billItems.forEach((billItem) => {
      // update if bill item already exists else insert
      const insertQuery = db.prepare(
        `INSERT OR REPLACE INTO bill_items (bill_id, menu_item_id, quantity, amount) VALUES (?, ?, ?, ?) `
      )
      const result = insertQuery.run(
        billId,
        billItem.item.id,
        billItem.quantity,
        billItem.item.price * billItem.quantity
      )
      console.log(result, 'bill item inserted')
    })
    return result
  } catch (err) {
    console.error(err, 'Update bill::')
    throw err
  }
}

const mapToBillItems = (billItems: any[]) => {
  if (billItems.length === 0) return []
  const convertedBilltem: BillItem[] = billItems.map((billItem) => {
    return {
      item: {
        id: billItem.menu_item_id,
        category_id: billItem.category_id,
        title: billItem.title,
        price: billItem.price
      },
      quantity: billItem.quantity
    }
  })

  return convertedBilltem
}

const converFlatListToBillInterface = (rowList: any[]) => {
  // convert flat list to bill interface each object in list will have single bill_id and invoice_number and multiple bill_items
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
    const billItemsMapped = mapToBillItems(billItems)
    const bill: Bill = {
      id: Number(billId),
      total: billItems.reduce((acc, billItem) => acc + billItem.amount, 0),
      items: billItemsMapped,
      invoice_number: billItems[0].invoice_number,
      date: billItems[0].created_at
    }
    bills.push(bill)
  })

  return bills
}
export const getBillsWithBillItems = async () => {
  try {
    // get all bills with bill items i only want the last 10 bills

    const query = `SELECT * FROM bills JOIN bill_items ON bills.id = bill_items.bill_id JOIN menu_item ON bill_items.menu_item_id = menu_item.id`
    const readQuery = db.prepare(query)
    const rowList = readQuery.all()
    console.log(rowList, 'Get all bills::')
    const billItems = converFlatListToBillInterface(rowList)
    // console.log(billItems, 'bills with bill items')
    return billItems
  } catch (err) {
    console.error(err, 'Get all bills::')
    throw err
  }
}

export const getLastInvoiceNumber = async () => {
  try {
    const query = `SELECT invoice_number FROM bills ORDER BY id DESC LIMIT 1`
    const readQuery = db.prepare(query)
    const rowList: { invoice_number: number }[] = readQuery.all() as any[]
    console.log(rowList, 'Get last invoice number::')
    if (rowList.length === 0) {
      return 0
    } else {
      return rowList[0].invoice_number
    }
  } catch (err) {
    console.error(err, 'Get last invoice number::')
    throw err
  }
}

export const getSalesForThisMonth = async () => {
  try {
    const query = `
  SELECT 
    strftime('%Y-%m', created_at) AS month,
    SUM(total_amount) AS total_sales
  FROM 
    bills
  WHERE 
    created_at >= date('now', '-12 months')
  GROUP BY 
    month
  ORDER BY
    month DESC;
`
    const readQuery = db.prepare(query)
    const rowList = readQuery.all()
    console.log(rowList, 'Get sales for this month::')
    return rowList
  } catch (error) {
    console.error(error, 'Error getting sales for this month::')
    throw error
  }
}

export const getDailySales = async () => {
  try {
    const query = `
    SELECT 
    strftime('%Y-%m-%d', created_at) AS date,
    strftime('%w', created_at) AS day_number,
    CASE strftime('%w', created_at)
      WHEN '0' THEN 'Sunday'
      WHEN '1' THEN 'Monday'
      WHEN '2' THEN 'Tuesday'
      WHEN '3' THEN 'Wednesday'
      WHEN '4' THEN 'Thursday'
      WHEN '5' THEN 'Friday'
      WHEN '6' THEN 'Saturday'
    END AS day_name,
    SUM(total_amount) AS total_sales
  FROM 
    bills
  WHERE 
    date(created_at) >= date('now', '-20 days')
  GROUP BY 
    date
  ORDER BY
    date DESC;
    `
    const readQuery = db.prepare(query)
    const rowList = readQuery.all()
    console.log(rowList, 'Get sales for last 20 days::')
    return rowList
  } catch (error) {
    console.error(error, 'Error getting sales for last 8 weeks::')
    throw error
  }
}

export const getSalesForLast8weeks = async () => {
  try {
    const query = `
  SELECT 
    strftime('%Y-%W', created_at) AS week,
    SUM(total_amount) AS total_sales
  FROM 
    bills
  WHERE 
    created_at >= datetime('now', '-56 days')
  GROUP BY 
    week
  ORDER BY
    week DESC;
`
    const readQuery = db.prepare(query)
    const rowList = readQuery.all()
    console.log(rowList, 'Get sales for last 8 weeks::')
    return rowList
  } catch (error) {
    console.error(error, 'Error getting sales for last 8 weeks::')
    throw error
  }
}

export const getDistinctItemsSoldDailyAndTheirCountAndSum = async () => {
  try {
    const query = `SELECT
    strftime('%Y-%m-%d', b.created_at) AS date,
    mi.id AS item_id,
    mi.title AS item_title,
    COUNT(DISTINCT bi.id) AS distinct_items_sold,
    SUM(bi.quantity) AS total_quantity_sold,
    SUM(bi.quantity * mi.price) AS total_sales
FROM
    bills b
JOIN
    bill_items bi ON b.id = bi.bill_id
JOIN
    menu_item mi ON bi.menu_item_id = mi.id
WHERE
    strftime('%Y-%W', b.created_at) = strftime('%Y-%W', 'now')
GROUP BY
    date, item_id
ORDER BY
    date;`

    const readQuery = db.prepare(query)
    const rowList = readQuery.all()
    console.log(rowList, 'Get distinct items sold and their count and sum::')
    return rowList
  } catch (error) {
    console.error(error, 'Error getting distinct items sold and their count and sum::')
    throw error
  }
}
