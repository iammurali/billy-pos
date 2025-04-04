import NumberCardWithProgress from '@renderer/components/dashboard/number-progress-card'
import { AddExpense } from '@renderer/components/expenses/addExpense'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@renderer/ui/table'
import dayjs from 'dayjs'
import { Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export const Expenses: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[] | null>()
  const [spentToday, setSpentToday] = useState()
  const [spentWeek, setSpentWeek] = useState()
  const [spentMonth, setSpentMonth] = useState()

  useEffect(() => {
    getExpenses()
    getExpenseAmount()
  }, [])

  const getExpenseAmount = async () => {
    const today = await window.electron.ipcRenderer.invoke('getTotalSpentByFilter', 'today')
    console.log(today)
    if (today && today.length > 0) {
      setSpentToday(today[0].total_amount)
    }
    const week = await window.electron.ipcRenderer.invoke('getTotalSpentByFilter', 'week')
    console.log(today)
    if (week && week.length > 0) {
      setSpentWeek(week[0].total_amount)
    }
    const month = await window.electron.ipcRenderer.invoke('getTotalSpentByFilter', 'month')
    console.log(today)
    if (month && month.length > 0) {
      setSpentMonth(month[0].total_amount)
    }
  }

  const getExpenses = async () => {
    try {
      const dbItems: Expense[] = await window.electron.ipcRenderer.invoke('getExpenses')
      setExpenses(dbItems)
    } catch (error) {
      console.log('error::', error)
    }
  }

  const deleteExpenseById = async (id: any) => {
    try {
      const dbItems: Expense[] = await window.electron.ipcRenderer.invoke('deleteExpenseById', id)
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
          <div className="flex flex-row gap-4 pb-4 justify-start">
            <NumberCardWithProgress
              title="This month expense"
              saleAmount={spentMonth}
              percentageChange={`Total Expense for the month`}
              progress={0}
            />
            <NumberCardWithProgress
              title="This week expense"
              saleAmount={spentWeek}
              percentageChange={`Total Expense for the week`}
              progress={0}
            />
            <NumberCardWithProgress
              title="Today's expense"
              saleAmount={spentToday}
              percentageChange={`Total Expense for the day`}
              progress={0}
            />
          </div>
          <Table className="p">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Index</TableHead>
                <TableHead>title</TableHead>
                <TableHead>category</TableHead>
                <TableHead className="text-center">date</TableHead>
                <TableHead className="text-center">Amount</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses &&
                expenses.length > 0 &&
                expenses.map((expense, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium">{idx + 1}</TableCell>
                    <TableCell>{expense.title}</TableCell>
                    <TableCell>{expense.category_name}</TableCell>
                    <TableCell className="text-center">
                      {dayjs(expense.created_at).format('DD/MM/YYYY')}
                    </TableCell>
                    <TableCell className="text-center">Rs.{expense.amount}</TableCell>
                    <TableCell className="text-right">
                      <button
                        onClick={() => {
                          deleteExpenseById(expense.id)
                          getExpenses()
                          toast('Expense deleted', {
                            position: 'top-center',
                            duration: 500
                          })
                        }}
                        className="p-1.5 rounded-sm bg-secondary hover:bg-danger-foreground"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
