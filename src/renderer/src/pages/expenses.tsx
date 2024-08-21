import { AddExpense } from '@renderer/components/expenses/addExpense'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@renderer/ui/table'
import dayjs from 'dayjs'
import { useEffect, useState } from 'react'

export const Expenses: React.FC = () => {

  const [expenses, setExpenses] = useState<Expense[] | null>()

  useEffect(()=>{
    getExpenses()
  },[])

  const getExpenses = async () => {
      try {
        const dbItems: Expense[] =
          await window.electron.ipcRenderer.invoke('getExpenses')
        setExpenses(dbItems)
      } catch (error) {
        console.log('error::', error)
      }
  }

  return (
    <div className={`flex w-full flex-row`} style={{ height: 'calc(100% - 1.75rem)' }}>
      <div className="w-full border-l border-border">
        <div className="overflow-y-scroll h-full p-4">
          <div className="flex flex-row justify-between pb-4 items-center">
            <h1 className="font-bold">EXPENSES</h1>
            <AddExpense getExpenses={getExpenses} />
          </div>
          <Table className="p">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Index</TableHead>
                <TableHead>title</TableHead>
                <TableHead>category</TableHead>
                <TableHead className='text-center'>date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses && expenses.length > 0 &&
                expenses.map((expense, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium">{idx + 1}</TableCell>
                    <TableCell>{expense.title}</TableCell>
                    <TableCell>{expense.category_name}</TableCell>
                    <TableCell className='text-center'>{dayjs(expense.created_at).format('DD/MM/YYYY')}</TableCell>
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
