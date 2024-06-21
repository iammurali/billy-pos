import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/ui/table"
  
  
  
  export function MonthlySales({ sales }: { sales: any[] }) {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Index</TableHead>
            <TableHead>Month</TableHead>
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sales.map((sale, idx) => (
            <TableRow key={sale.month}>
              <TableCell className="font-medium">{idx+1}</TableCell>
              <TableCell>{sale.month}</TableCell>
              <TableCell className="text-right">Rs.{sale.total_sales}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      
      </Table>
    )
  }
  