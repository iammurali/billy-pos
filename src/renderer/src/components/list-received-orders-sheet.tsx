import React from 'react'
import { Button } from '@/ui/button'
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
import { DateTime } from 'luxon'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/ui/table'
import { Smartphone, Clock, Check, X, PlusCircle } from 'lucide-react'

interface MobileOrder {
  id: string;
  order_number: string;
  items: Array<{
    menu_item_id: number;
    quantity: number;
    price: number;
    title: string;
  }>;
  total_amount: number;
  sent_to_kitchen: boolean;
  sent_for_billing: boolean;
  created_at: string;
}

interface MobileOrdersSheetProps {
  mobileOrders: MobileOrder[];
  onClickMobileOrders: () => void;
  onAddToBilling: (order: MobileOrder) => void;
}

export function MobileOrdersSheet({ mobileOrders, onClickMobileOrders, onAddToBilling }: MobileOrdersSheetProps) {
  const formatRelativeTime = (isoString: string) => {
    const orderTime = DateTime.fromISO(isoString);
    const now = DateTime.local();
    const diff = now.diff(orderTime, ['hours', 'minutes']);

    if (diff.hours >= 1) {
      return `${Math.floor(diff.hours)} hour${diff.hours >= 2 ? 's' : ''} ago`;
    } else {
      return `${Math.floor(diff.minutes)} minute${diff.minutes !== 1 ? 's' : ''} ago`;
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button onClick={onClickMobileOrders} className="mr-2" variant={'outline'} size="sm">
          <Smartphone size={13} className='mr-1' /> Mobile Orders
        </Button>
      </SheetTrigger>
      <SheetContent className="p-0 min-w-[500px]">
        <SheetHeader className="p-4 border-b">
          <SheetTitle className='flex flex-row items-center'><Smartphone className='mr-2' /> Mobile Orders</SheetTitle>
          <SheetDescription>Orders placed through the mobile app.</SheetDescription>
        </SheetHeader>
        <div className="h-[90%] w-full overflow-y-scroll pt-2 pb-8 px-4">
          {mobileOrders.length === 0 ? (
            <div className="text-center py-4">No mobile orders found.</div>
          ) : (
            mobileOrders.map((order, index) => (
              <div className="mb-4 flex flex-col border" key={index}>
                <div className="flex flex-row justify-between items-center bg-secondary p-2">
                  {/* <div className="pr-2 flex flex-row items-center">
                    <Clock size={20} className='mr-2' />
                    {formatRelativeTime(order.created_at)}
                  </div> */}
                  <div className="flex items-center">
                    <span className="mr-2">Order #: {order.order_number}</span>
                    <span className="mr-2">Kitchen: {order.sent_to_kitchen ? <Check className="text-green-500" /> : <X className="text-red-500" />}</span>
                    <span className="mr-2">Billing: {order.sent_for_billing ? <Check className="text-green-500" /> : <X className="text-red-500" />}</span>
                    <Button
                      onClick={() => onAddToBilling(order)}
                      className="ml-2"
                      variant="outline"
                      size="sm"
                      disabled={order.sent_for_billing}
                    >
                      <PlusCircle size={13} className='mr-1' /> Add to Billing
                    </Button>
                  </div>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {order.items.map((item, itemIndex) => (
                      <TableRow key={itemIndex}>
                        <TableCell>{item.title}</TableCell>
                        <TableCell>{item.price}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell className='text-right'>{item.quantity * item.price}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={3}>Total</TableCell>
                      <TableCell className='font-bold text-right'>
                        {order.total_amount}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            ))
          )}
        </div>
        <SheetFooter></SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
