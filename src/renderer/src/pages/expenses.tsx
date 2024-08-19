import { AddExpense } from '@renderer/components/expenses/addExpense'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@renderer/ui/table'

const expenses = [
  {
    id: 1,
    item: 'Frozen foods',
    amount: 2000
  },
  {
    id: 2,
    item: 'Coffee',
    amount: 4000
  }
]

export const Expenses: React.FC = () => {
  return (
    <div className={`flex w-full flex-row`} style={{ height: 'calc(100% - 1.75rem)' }}>
      <div className="w-full border-l border-border">
        <div className="overflow-y-scroll h-full p-4">
          <div className="flex flex-row justify-between pb-4 items-center">
            <h1 className="font-bold">EXPENSES</h1>
            <AddExpense />
          </div>
          <Table className="border p">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Index</TableHead>
                <TableHead>Week</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.length > 0 &&
                expenses.map((expense, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium">{idx + 1}</TableCell>
                    <TableCell>{expense.item}</TableCell>
                    <TableCell className="text-right">Rs.{expense.amount}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
