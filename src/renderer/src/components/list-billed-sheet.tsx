import { Button } from '@/ui/button'
import { Input } from '@/ui/input'
import { Label } from '@/ui/label'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@/ui/sheet'

import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/ui/table'
import { ReceiptIndianRupeeIcon } from 'lucide-react'

dayjs.extend(utc)

export function BilledBills({onClickBills, billedBills}: {onClickBills: () => void, billedBills?: any[]}) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button 
        onClick={() => onClickBills()} 
        className="mr-2" variant={'outline'} size="sm">
          <ReceiptIndianRupeeIcon size={13} className='mr-1' /> Bills
        </Button>
      </SheetTrigger>
      <SheetContent className="p-0">
        <SheetHeader className="p-4 border-b">
          <SheetTitle className='flex flex-row items-center'><ReceiptIndianRupeeIcon className='mr-2' /> Invoiced bills</SheetTitle>
          <SheetDescription>Shows list of previous bills.</SheetDescription>
        </SheetHeader>
        <div className="h-[90%] w-full overflow-y-scroll pt-2 pb-8 px-4">
          {billedBills?.map((bill, index) => (
            <div className="mb-1 p-2 flex flex-col border" key={index}>
              <div className="flex flex-row justify-between items-center">
                <div className="pr-2">{dayjs.utc(bill.date, 'YYYY-MM-DD').format('DD/MM/YYYY hh:mm a')}</div>
                <div>
                  <Button disabled onClick={() => onClickBills()} className='mr-2' variant={'destructive'} size={'sm'}>
                    Delete
                  </Button>
                </div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>name</TableHead>
                    <TableHead>price</TableHead>
                    <TableHead>qty</TableHead>
                    <TableHead>amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bill.items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.title}</TableCell>
                      <TableCell>{item.price}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{item.price * item.quantity}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell>
                      Total
                    </TableCell>
                    <TableCell >
                    </TableCell>
                    <TableCell>
                    </TableCell>
                    <TableCell className='font-bold'>{bill.total}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          ))}
          {/* {draftBills?.reverse().map((bill, index) => (
            <div className="mb-1 p-2 flex flex-col border" key={index}>
              <div className="flex flex-row justify-between items-center">
                <div className="pr-2">{dayjs().to(dayjs(bill.billedDateandTime))}</div>
                <div>
                  <Button onClick={() => deleteDraft(bill)} className='mr-2' variant={'destructive'} size={'sm'}>
                    Delete
                  </Button>
                  <Button onClick={() => restoreDraft(bill)} variant={'outline'} size={'sm'}>
                    Restore
                  </Button>
                </div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>name</TableHead>
                    <TableHead>price</TableHead>
                    <TableHead>qty</TableHead>
                    <TableHead>amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bill.billItems.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.item.title}</TableCell>
                      <TableCell>{item.item.price}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{item.quantity * item.item.price}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell>Total</TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell>
                      {bill.billItems.reduce(
                        (acc, item) => acc + item.quantity * item.item.price,
                        0
                      )}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          ))} */}
        </div>
        <SheetFooter></SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
