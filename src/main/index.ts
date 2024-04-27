import { app, shell, BrowserWindow, ipcMain } from 'electron'
import path, { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { PosPrinter, PosPrintData, PosPrintOptions } from 'electron-pos-printer'
import { getMenuItems, addMenuItem, deleteMenuItem, updateMenuItem, saveBill, getBillsWithBillItems, updateBill, getLastInvoiceNumber } from './db'
import * as fs from 'fs'
import { IMenuItem } from './types/sharedTypes'

async function printBill(billItems: BillItem[], totalAmount: number): Promise<void> {
  console.log('event from frontend::::', billItems, totalAmount)
  const options: PosPrintOptions = {
    preview: true,
    margin: '0 0 0 0',
    copies: 1,
    // printerName: 'XP-80C',
    timeOutPerLine: 400,
    pageSize: '80mm', // page size
    boolean: undefined
  }

  const data: PosPrintData[] = [
    // {
    //   type: 'image',
    //   url: 'https://randomuser.me/api/portraits/men/43.jpg', // file path
    //   position: 'center', // position of image: 'left' | 'center' | 'right'
    //   width: '160px', // width of image in px; default: auto
    //   height: '60px' // width of image in px; default: 50 or '50px'
    // },
    {
      type: 'text', // 'text' | 'barCode' | 'qrCode' | 'image' | 'table
      value: 'Edaikazhinadu coffee house',
      style: { fontWeight: '700', textAlign: 'center', fontSize: '18px' }
    },
    {
      type: 'text', // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
      value: 'vilambur, edaikazhinadu, TN - 603304',
      style: { fontSize: '10px', textAlign: 'center' }
    },
    // {
    //   type: 'barCode',
    //   value: '023456789010',
    //   height: '40', // height of barcode, applicable only to bar and QR codes
    //   width: '2', // width of barcode, applicable only to bar and QR codes
    //   displayValue: true, // Display value below barcode
    //   fontsize: 12
    // },
    // {
    //   type: 'qrCode',
    //   value: 'https://github.com/Hubertformin/electron-pos-printer',
    //   height: '55',
    //   width: '55',
    //   style: { margin: '10 20px 20 20px' }
    // },
    {
      type: 'table',
      // style the table
      style: { border: '1px solid #ddd' },
      // list of the columns to be rendered in the table header
      tableHeader: ['Name', 'Price', 'Qty', 'Amount'],
      // multi dimensional array depicting the rows and columns of the table body
      tableBody: [...billItems.map((item: BillItem)=> [item.item.title, item.item.price.toString(), item.quantity.toString(), (item.item.price * item.quantity).toString()])],
      // list of columns to be rendered in the table footer
      tableFooter: ['Total Bill', '', '', totalAmount.toString()],
      // custom style for the table header
      tableHeaderStyle: {border: '0.5px solid #ddd' },
      // custom style for the table body
      tableBodyStyle: { border: '0.5px solid #ddd', textAlign: 'left' },
      // custom style for the table footer
      tableFooterStyle: { border: '0.5px solid #ddd' }
    },

  ]

  // save data to datbase

  PosPrinter.print(data, options)
    .then(console.log)
    .catch((error) => {
      console.error(error)
    })
}

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

function debugPrint() {
  try {
    console.log('ADD DEBUG PRINT HERE')
    // fs.appendFileSync(
    //   'myfile.txt',
    //   path.join(app.getAppPath(), '..', 'Resources', 'app.asar.unpacked', 'coffeehouse.db'),
    //   'utf-8'
    // )
  } catch (e) {
    alert('Failed to save the file !')
  }
  return path.join(app.getAppPath(), './coffeehouse.db')
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  // printBill()
  ipcMain.handle('print', async (_event: any, billItems: BillItem[], totalAmount: number) => {
    const result = await printBill(billItems, totalAmount)
    return result
  })
  ipcMain.handle('addMenuItem', async (_event: any, menuItem: IMenuItem) => {
    const result = await addMenuItem(menuItem)
    console.log(result, 'inserted menu item')
    return result
  })
  ipcMain.handle('updateMenuItem', async (_event: any, menuItem: IMenuItem) => {
    const result = await updateMenuItem(menuItem)
    console.log(result, 'updated menu item')
    return result
  })
  ipcMain.handle('deleteMenuItem', async (_event: any, id: number) => {
    const result = await deleteMenuItem(id)
    console.log(result, 'deleted menu item')
    return result
  })
  ipcMain.handle('saveBill',async (_event: any, billItems: BillItem[], totalAmount: number, invoiceNumber: string) => saveBill(billItems, totalAmount, invoiceNumber))
  ipcMain.handle('updateBill', async (_event: any, billItems: BillItem[], totalAmount: number, invoiceNumber: string, id: number) => updateBill(billItems, totalAmount, invoiceNumber, id))
  ipcMain.handle('getLastInvoiceNumber', async () => getLastInvoiceNumber())
  ipcMain.handle('getBillsWithBillItems', async () => getBillsWithBillItems())
  ipcMain.handle('getMenuItems', async () => getMenuItems())
  ipcMain.handle('debuggermethod', async () => debugPrint())

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
