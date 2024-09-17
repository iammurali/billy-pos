import { app, shell, BrowserWindow, ipcMain } from 'electron'
import path, { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { networkInterfaces } from 'os';
import icon from '../../resources/icon.png?asset'
import { PosPrinter, PosPrintData, PosPrintOptions } from 'electron-pos-printer'
import {
  getMenuItems,
  addMenuItem,
  deleteMenuItem,
  updateMenuItem,
  saveBill,
  getBillsWithBillItems,
  updateBill,
  getLastInvoiceNumber,
  getSalesForThisMonth,
  getSalesForLast8weeks,
  getDailySales,
  getDistinctItemsSoldDailyAndTheirCountAndSum,
  getExpenseCategories,
  addExpenseCategory,
  addExpense,
  getExpenses,
  getTotalSpentByFilter,
  deleteExpenseById,
  getAllOrders,
  updateOrderStatus
} from './db'
import { IMenuItem } from './types/sharedTypes'
import { createExpressApp, startExpressServer } from './server'

// async function printBill(billItems: BillItem[], totalAmount: number): Promise<void> {
//   console.log('event from frontend::::', billItems, totalAmount)
//     // Get the path to the image file
//   const imagePath = path.join(app.getAppPath(), 'src', 'renderer', 'src', 'assets', 'coffeehouselogo.jpg')
//   const options: PosPrintOptions = {
//     preview: true,
//     margin: '0 0 0 0',
//     copies: 1,
//     // printerName: 'XP-80C',
//     timeOutPerLine: 800,
//     pageSize: '80mm', // page size
//     boolean: undefined
//   }

//   const data: PosPrintData[] = [
//     {
//       type: 'image',
//       path: imagePath, // Use the local file path
//       position: 'center', // position of image: 'left' | 'center' | 'right'
//       width: '160px', // width of image in px; default: auto
//       height: '160px' // width of image in px; default: 50 or '50px'
//     },
//     {
//       type: 'text', // 'text' | 'barCode' | 'qrCode' | 'image' | 'table
//       value: 'Edaikazhinadu coffee house',
//       style: { fontWeight: '700', textAlign: 'center', fontSize: '18px' }
//     },
//     {
//       type: 'text', // 'text' | 'barCode' | 'qrCode' | 'image' | 'table'
//       value: 'vilambur, edaikazhinadu, TN - 603304',
//       style: { fontSize: '10px', textAlign: 'center' }
//     },
//     // {
//     //   type: 'barCode',
//     //   value: '023456789010',
//     //   height: '40', // height of barcode, applicable only to bar and QR codes
//     //   width: '2', // width of barcode, applicable only to bar and QR codes
//     //   displayValue: true, // Display value below barcode
//     //   fontsize: 12
//     // },
//     // {
//     //   type: 'qrCode',
//     //   value: 'https://github.com/Hubertformin/electron-pos-printer',
//     //   height: '55',
//     //   width: '55',
//     //   style: { margin: '10 20px 20 20px' }
//     // },
//     {
//       type: 'table',
//       // style the table
//       // style: { border: '1px solid #ddd' },
//       // list of the columns to be rendered in the table header
//       tableHeader: ['Name', 'Price', 'Qty', 'Amount'],
//       // multi dimensional array depicting the rows and columns of the table body
//       tableBody: billItems.map((item: BillItem) => [
//         {
//           type: 'text',
//           value: item.item.title.toUpperCase(),
//           style: { fontWeight: '800', textAlign: 'left', fontSize: '10px' }
//         },
//         {
//           type: 'text',
//           value: item.item.price.toString(),
//           style: { fontWeight: '700', textAlign: 'center', fontSize: '9px' }
//         },
//         {
//           type: 'text',
//           value: item.quantity.toString(),
//           style: { fontWeight: '700', textAlign: 'center', fontSize: '9px' }
//         },
//         {
//           type: 'text',
//           value: (item.item.price * item.quantity).toString(),
//           style: { fontWeight: '700', textAlign: 'center', fontSize: '9px' }
//         }
//       ]),
//       // list of columns to be rendered in the table footer
//       tableFooter: ['Total Bill', '', '', totalAmount.toString()],
//       // custom style for the table header
//       tableHeaderStyle: {
//         // border: '0.5px solid #ddd',
//         fontWeight: '700',
//         textAlign: 'left',
//         fontSize: '9px'
//       },
//       // custom style for the table body
//       tableBodyStyle: {
//         border: '0.5px solid #ddd',
//         textAlign: 'left',
//         fontSize: '8px',
//         fontFamily: 'monospace',
//         padding: '0',
//       },
//       // custom style for the table footer
//       tableFooterStyle: { border: '0.5px solid #ddd' }
//     }
//   ]
//   // const data: PosPrintData[] = [
//   //   {
//   //     type: 'text',
//   //     value: 'Edaikazhinadu coffee house',
//   //     style: {
//   //       fontWeight: '700',
//   //       textAlign: 'center',
//   //       fontSize: '14px', // Adjusted font size for better fit
//   //       marginBottom: '5px' // Added margin for spacing
//   //     }
//   //   },
//   //   {
//   //     type: 'text',
//   //     value: 'vilambur, edaikazhinadu, TN - 603304',
//   //     style: {
//   //       fontSize: '10px',
//   //       textAlign: 'center',
//   //       marginBottom: '10px' // Added margin for spacing
//   //     }
//   //   },
//   //   {
//   //     type: 'table',
//   //     style: { border: '0.5px solid #ddd' }, // Adjusted border style
//   //     tableHeader: ['Name', 'Price', 'Qty', 'Amount'],
//   //     tableBody: billItems.map((item: BillItem) => [
//   //       {
//   //         type: 'text',
//   //         value: item.item.title.toUpperCase(),
//   //         style: {
//   //           fontWeight: '800',
//   //           textAlign: 'left',
//   //           fontSize: '8px', // Adjusted font size
//   //           paddingRight: '5px' // Added padding for alignment
//   //         }
//   //       },
//   //       {
//   //         type: 'text',
//   //         value: item.item.price.toString(),
//   //         style: {
//   //           fontWeight: '800',
//   //           textAlign: 'center',
//   //           fontSize: '8px' // Adjusted font size
//   //         }
//   //       },
//   //       {
//   //         type: 'text',
//   //         value: item.quantity.toString(),
//   //         style: {
//   //           fontWeight: '800',
//   //           textAlign: 'center',
//   //           fontSize: '8px' // Adjusted font size
//   //         }
//   //       },
//   //       {
//   //         type: 'text',
//   //         value: (item.item.price * item.quantity).toString(),
//   //         style: {
//   //           fontWeight: '800',
//   //           textAlign: 'center',
//   //           fontSize: '8px' // Adjusted font size
//   //         }
//   //       }
//   //     ]),
//   //     tableFooter: ['Total Bill', '', '', totalAmount.toString()],
//   //     tableHeaderStyle: {
//   //       border: '0.5px solid #ddd',
//   //       fontWeight: '700',
//   //       textAlign: 'left',
//   //       fontSize: '8px', // Adjusted font size
//   //       padding: '-2px 0' // Added padding for spacing
//   //     },
//   //     tableBodyStyle: {
//   //       border: '0.5px solid #ddd',
//   //       textAlign: 'left',
//   //       fontSize: '7px', // Adjusted font size
//   //       fontFamily: 'monospace',
//   //       padding: '- 0' // Added padding for spacing
//   //     },
//   //     tableFooterStyle: {
//   //       border: '0.5px solid #ddd',
//   //       fontWeight: '700',
//   //       fontSize: '8px', // Adjusted font size
//   //       padding: '-2px 0' // Added padding for spacing
//   //     }
//   //   }
//   // ];


//   // save data to datbase

//   PosPrinter.print(data, options)
//     .then(console.log)
//     .catch((error) => {
//       console.error(error)
//     })
// }

async function printBill(billItems: BillItem[], totalAmount: number): Promise<void> {
  console.log('event from frontend::::', billItems, totalAmount);
  console.log('imagepath:'+ path.join(process.resourcesPath, 'data/googlepayqr.jpeg'))

  const imagePath = process.env.NODE_ENV === 'development'
  ? path.join(app.getAppPath(), 'src', 'renderer', 'src', 'assets', 'coffeehouselogo.jpg')
  : path.join(process.resourcesPath, 'data/coffeehouselogo.jpg');

  const qrPath = process.env.NODE_ENV === 'development'
  ? path.join(app.getAppPath(), 'src', 'renderer', 'src', 'assets', 'googlepayqr.jpeg')
  : path.join(process.resourcesPath, 'data/googlepayqr.jpeg')

  const options: PosPrintOptions = {
    // preview: true,
    margin: '0 0 0 0',
    copies: 1,
    timeOutPerLine: 800,
    pageSize: '80mm',
    boolean: undefined,
    // dpi: {
    //   horizontal: 153,
    //   vertical:  153
    // }
    // width: '80mm', // Set a specific width for better control
  };
  const data: PosPrintData[] = [
    {
      type: 'image',
      path: imagePath,
      position: 'center',
      width: '150px',
      height: '150px',
    },
    {
      type: 'text',
      value: 'Vilambur, Edaikazhinadu, TN - 603304',
      style: { fontSize: '10px', textAlign: 'center', marginBottom: '5px' },
    },
    {
      type: 'text',
      value: 'Phone: +91 9715019994',
      style: { fontSize: '10px', textAlign: 'center', marginBottom: '10px' },
    },
    {
      type: 'table',
      tableHeader: ['Item', 'Qty', 'Price', 'Amount'],
      tableBody: billItems.map((item: BillItem) => [
        {
          type: 'text',
          value: item.item.title.toUpperCase(),
          style: { fontWeight: 'bold', fontSize: '9px', paddingRight: '5px', textAlign: 'left' },
        },
        {
          type: 'text',
          value: item.quantity.toString(),
          style: {  fontWeight: 'bold', textAlign: 'center', fontSize: '9px' },
        },
        {
          type: 'text',
          value: item.item.price.toFixed(2),
          style: { fontWeight: 'bold', textAlign: 'right', fontSize: '9px' },
        },
        {
          type: 'text',
          value: (item.item.price * item.quantity).toFixed(2),
          style: { fontWeight: 'bold', textAlign: 'right', fontSize: '9px' },
        },
      ]),
      tableFooter: ['', '', 'Total:', totalAmount.toFixed(2)],
      tableHeaderStyle: {
        fontSize: '10px',
        fontWeight: 'bold',
        borderBottom: '1px solid black',
        paddingBottom: '5px',
      },
      tableBodyStyle: {
        fontSize: '9px',
        paddingTop: '5px',
        paddingBottom: '5px',
      },
      tableFooterStyle: {
        fontSize: '10px',
        fontWeight: 'bold',
        borderTop: '1px solid black',
        paddingTop: '5px',
      },
    },
    {
      type: 'text',
      value: 'Scan QR To Pay via UPI',
      style: { textAlign: 'center', fontSize: '10px', fontWeight: 'bold' },
    },
    {
      type: 'image',
      path: qrPath,
      position: 'center',
      width: '80px',
      height: '80px',
      style: { marginTop: '5px', marginBottom: '5px'}
    },
    {
      type: 'text',
      value: '-*- பகுத்து உண்டு பல் உயிர் ஓம்புதல் -*-',
      style: { textAlign: 'center', fontSize: '10px', fontWeight: 'bold' },
    },
    {
      type: 'text',
      value: new Date().toLocaleString(),
      style: { textAlign: 'center', fontSize: '8px', marginTop: '5px' },
    },
  ];
  try {
    await PosPrinter.print(data, options);
    console.log('Printing successful');
  } catch (error) {
    console.error('Printing failed:', error);
  }
}

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1000,
    height: 770,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.maximize()

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
  ipcMain.handle(
    'saveBill',
    async (_event: any, billItems: BillItem[], totalAmount: number, invoiceNumber: string) =>
      saveBill(billItems, totalAmount, invoiceNumber)
  )
  ipcMain.handle(
    'updateBill',
    async (
      _event: any,
      billItems: BillItem[],
      totalAmount: number,
      invoiceNumber: string,
      id: number
    ) => updateBill(billItems, totalAmount, invoiceNumber, id)
  )
  ipcMain.handle('getLastInvoiceNumber', async () => getLastInvoiceNumber())
  ipcMain.handle('getBillsWithBillItems', async () => getBillsWithBillItems())
  ipcMain.handle('getTotalSalesForThisMonth', async () => getSalesForThisMonth())
  ipcMain.handle('getDailySales', async () => getDailySales())
  ipcMain.handle('getSalesForLast8weeks', async () => getSalesForLast8weeks())
  ipcMain.handle('getDistinctItemsSoldDailyAndTheirCountAndSum', async () =>
    getDistinctItemsSoldDailyAndTheirCountAndSum()
  )
  ipcMain.handle('getMenuItems', async () => getMenuItems())
  ipcMain.handle('getExpenseCategories', async () => getExpenseCategories())
  ipcMain.handle('debuggermethod', async () => debugPrint())
  ipcMain.handle('addExpenseCategory', async (_event: any, name: string) =>
    addExpenseCategory(name)
  )
  ipcMain.handle(
    'addExpense',
    async (_event: any, title: string, category_id: number, description: string, amount: number) =>
      addExpense(title, category_id, description, amount)
  )
  ipcMain.handle('getExpenses', async () => getExpenses())
  ipcMain.handle('getTotalSpentByFilter', async (_event: any, type: 'today' | 'week' | 'month') =>
    getTotalSpentByFilter(type)
  )
  ipcMain.handle('deleteExpenseById', async (_event: any, id: string) =>
    deleteExpenseById(id)
  )
  ipcMain.handle('getMobileOrders', async () => {
    try {
      const orders = getAllOrders()
      return orders
    } catch (error) {
      console.error('Error fetching mobile orders:', error)
      return []
    }
  })
  ipcMain.handle('updateOrderStatus', async (_event, orderId: number, sentToKitchen: boolean, sentForBilling: boolean) => {
    try {
      const result = updateOrderStatus(orderId, sentToKitchen, sentForBilling);
      return result;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  });
  ipcMain.handle('get-ip-address', () => {
    const nets: any = networkInterfaces();
    for (const name of Object.keys(nets)) {
      for (const net of nets[name]) {
        // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
        if (net.family === 'IPv4' && !net.internal) {
          return net.address;
        }
      }
    }
    return 'Unable to determine IP address';
  });


  const expressApp = createExpressApp();
  startExpressServer(expressApp);

  createWindow();

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
