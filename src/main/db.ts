import Database from 'better-sqlite3';
import { IMenuItem } from '../types/sharedTypes'
import path from 'path';
import { app } from 'electron/main';

console.log(process.resourcesPath, 'resourcepath', app.getAppPath())

const dbPath =
    process.env.NODE_ENV === "development"
        ? './coffeehouse.db'
        : path.join(process.resourcesPath, 'data/coffeehouse.db');

console.log(dbPath, "DB PATH:::::::")

const db = new Database(dbPath, {fileMustExist: true});

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

