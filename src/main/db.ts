import Database from 'better-sqlite3';
import { IMenuItem } from '../types/sharedTypes'

const db = new Database('./coffeehouse.db', { verbose: console.log });

db.pragma('journal_mode = WAL');
let i=0

export const getMenuItems = (): IMenuItem[] => {
  try {
      i += 1
      console.log('IPC method called', i)
      const query = `SELECT * FROM menu_item`
      const readQuery = db.prepare(query)
      const rowList = readQuery.all() as IMenuItem[]
      console.log(rowList[0])
      return rowList
  } catch (err) {
      console.error(err, 'Get all menu items::')
      throw err
  }
}

