import { DailySales } from '@renderer/components/daily-sales'
import { ChartCard } from '@renderer/components/dashboard/chart-card'
import NumberCardWithProgress from '@renderer/components/dashboard/number-progress-card'
import { MonthlySales } from '@renderer/components/monthly-sales'
import { WeeklySales } from '@renderer/components/weekly-sales'
import React, { useEffect, useState } from 'react'
import { number } from 'zod'

const Reports: React.FC = () => {
  const [totalSalesForEachMonth, settotalSalesForEachMonth] = useState([])
  const [salesByDays, setsalesByDays] = useState([])
  const [totalSalesForEachWeek, settotalSalesForEachWeek] = useState([])
  const [salesPercentageChangeFromLastMonth, setsalesPercentageChangeFromLastMonth] =
    useState<number>(0)
  const [salesPercentageChangeFromYesterDay, setsalesPercentageChangeFromYesterDay] =
    useState<number>(0)

  useEffect(() => {
    console.log('hello world')
    getTotalSalesForThisMonth()
    getSalesByDays()
    getSalesForLast8weeks()
    getDistinctItemsSoldDailyAndTheirCountAndSum()
  }, [])

  const getTotalSalesForThisMonth = async () => {
    let result = await window.electron.ipcRenderer.invoke('getTotalSalesForThisMonth')

    console.log(result)
    settotalSalesForEachMonth(result)

    if (result.length > 1) {
      const lastMonthSales = result[1]['total_sales']
      const thisMonthSales = result[0]['total_sales']
      const percentageChange = ((thisMonthSales - lastMonthSales) / lastMonthSales) * 100
      const percentageChangeFixed = Number(percentageChange.toFixed(2))

      setsalesPercentageChangeFromLastMonth(percentageChangeFixed)
    }
  }

  const getSalesByDays = async () => {
    let dailyResult = await window.electron.ipcRenderer.invoke('getDailySales')
    console.log(dailyResult)
    setsalesByDays(dailyResult)

    if (dailyResult.length > 1) {
      const yesterdaySales = dailyResult[1]['total_sales']
      const todaysSales = dailyResult[0]['total_sales']

      const percentageChange = ((todaysSales - yesterdaySales) / yesterdaySales) * 100
      const percentageChangeFixed = Number(percentageChange.toFixed(2))

      setsalesPercentageChangeFromYesterDay(percentageChangeFixed)
    }
  }

  const getSalesForLast8weeks = async () => {
    let result = await window.electron.ipcRenderer.invoke('getSalesForLast8weeks')
    console.log(result)
    settotalSalesForEachWeek(result)

    if (result.length > 1) {
      const lastWeekSales = result[1]['total_sales']
      const thisWeekSales = result[0]['total_sales']
      const percentageChange = ((thisWeekSales - lastWeekSales) / lastWeekSales) * 100
      const percentageChangeFixed = Number(percentageChange.toFixed(2))

      setsalesPercentageChangeFromLastMonth(percentageChangeFixed)
    }
  }

  const getDistinctItemsSoldDailyAndTheirCountAndSum = async () => {
    let result = await window.electron.ipcRenderer.invoke(
      'getDistinctItemsSoldDailyAndTheirCountAndSum'
    )
    console.log(result)
  }

  return (
    <div className={`flex w-full flex-row`} style={{ height: 'calc(100% - 1.75rem)' }}>
      {/* <div className="w-1/4 border-r border-border h-full">HELLO WORLD</div> */}
      <div className="w-full border-l border-border">
        <div className="overflow-y-scroll h-full p-4">
          <h1 className="pt-4 font-bold">REPORTS</h1>
          <div className="flex flex-row gap-12 pt-4 justify-between">
            <NumberCardWithProgress
              title="This month sales"
              saleAmount={
                totalSalesForEachMonth.length > 0 ? totalSalesForEachMonth[0]['total_sales'] : 0
              }
              percentageChange={`${salesPercentageChangeFromLastMonth}% from last month`}
              progress={salesPercentageChangeFromLastMonth}
            />
            <NumberCardWithProgress
              title="Today's sales"
              saleAmount={salesByDays.length > 0 ? salesByDays[0]['total_sales'] : 0}
              percentageChange={`${salesPercentageChangeFromYesterDay}% from yesterday`}
              progress={salesPercentageChangeFromYesterDay}
            />
            <NumberCardWithProgress
              title="This week sales"
              saleAmount={
                totalSalesForEachWeek.length > 0 ? totalSalesForEachWeek[0]['total_sales'] : 0
              }
              percentageChange={`${salesPercentageChangeFromYesterDay}% from last week`}
              progress={salesPercentageChangeFromYesterDay}
            />
          </div>
          <div className="flex flex-row gap-4 pt-4 justify-center items-center border rounded-lg mt-4">
            <div className="h-[60vh] w-full flex flex-col justify-center items-center">
              <ChartCard data={totalSalesForEachMonth} />
            </div>
          </div>
          <h3 className="pt-4 font-bold">Monthly Sales</h3>
          <div className="pt-4 flex flex-col gap-2">
            <div className="border">
              <MonthlySales sales={totalSalesForEachMonth} />
            </div>
          </div>
          <h3 className="pt-4 font-bold">Weekly Sales</h3>
          <div className="pt-4">
            <WeeklySales sales={totalSalesForEachWeek} />
          </div>
          <h3 className="pt-4 font-bold">Daily Sales</h3>
          <div className="pt-4">
            <DailySales sales={salesByDays} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Reports
