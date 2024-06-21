import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/ui/table"
  
  
  
export function WeeklySales({ sales }: { sales: { week: string; total_sales: number; }[] }) {
  return (
    <Table className="border">
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Index</TableHead>
          <TableHead>Week</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sales.map((sale, idx) => (
          <TableRow key={sale.week}>
            <TableCell className="font-medium">{idx+1}</TableCell>
            <TableCell>{sale.week}</TableCell>
            <TableCell className="text-right">Rs.{sale.total_sales}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    
    </Table>
  )
}
  