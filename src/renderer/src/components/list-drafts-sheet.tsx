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
import relativeTime from 'dayjs/plugin/relativeTime'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/ui/table'
import { Archive, Clock, Recycle, Trash2 } from 'lucide-react'

dayjs.extend(relativeTime)

export function DraftBills({ draftBills, restoreDraft, deleteDraft, onClickDrafts }: { draftBills?: DraftBill[], restoreDraft: (draftBill: DraftBill) => void, deleteDraft: (draftBill: DraftBill) => void, onClickDrafts: () => void }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button onClick={() => onClickDrafts()} className="mr-2" variant={'outline'} size="sm">
          <Archive size={13} className='mr-1' /> Drafts
        </Button>
      </SheetTrigger>
      <SheetContent className="p-0">
        <SheetHeader className="p-4 border-b">
          <SheetTitle className='flex flex-row items-center'><Archive className='mr-2' /> Draft bills</SheetTitle>
          <SheetDescription>Click on restore to bring it back for billing and delete to remove from draft list.</SheetDescription>
        </SheetHeader>
        <div className="h-[90%] w-full overflow-y-scroll pt-2 pb-8 px-4">
          {draftBills?.map((bill, index) => (
            <div className="mb-1 flex flex-col border" key={index}>
              <div className="flex flex-row justify-between items-center bg-secondary p-2">
                <div className="pr-2 flex flex-row items-center"><Clock size={20} className='mr-2' /> {dayjs().to(dayjs(bill.billedDateandTime))}</div>
                <div>
                  <Button onClick={() => deleteDraft(bill)} className='mr-2' variant={'destructive'} size={'sm'}>
                    <Trash2  size={16} />
                  </Button>
                  <SheetClose>
                  <Button className='' onClick={() => restoreDraft(bill)} variant={'default'} size={'sm'}>
                    <Recycle size={16} /> Restore
                  </Button>
                  </SheetClose>
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
                      <TableCell className='text-right'>{item.quantity * item.item.price}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell>Total</TableCell>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell className='font-bold text-right'>
                      {bill.billItems.reduce(
                        (acc, item) => acc + item.quantity * item.item.price,
                        0
                      )}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          ))}
        </div>
        <SheetFooter></SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
