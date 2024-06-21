import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/ui/table"
  
  
  
export function DailySales({ sales }: { sales: { date: string; total_sales: number; day_name: string }[] }) {
  return (
    <Table className="border">
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Index</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Day</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sales.map((sale, idx) => (
          <TableRow key={sale.date}>
            <TableCell className="font-medium">{idx+1}</TableCell>
            <TableCell>{sale.date}</TableCell>
            <TableCell>{sale.day_name}</TableCell>
            <TableCell className="text-right">Rs.{sale.total_sales}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    
    </Table>
  )
}
  