import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'

export function ChartCard({data}: {data: any[]}) {
  return (

        <ResponsiveContainer width="100%" height="100%">
          <BarChart width={400} height={340} data={data}>
            <Tooltip />
            <Bar dataKey="total_sales" fill="#8884d8" />
            <XAxis dataKey="month" />
            <YAxis dataKey="total_sales" />
            {/* <CartesianGrid stroke='#ccc' /> */}
          </BarChart>
        </ResponsiveContainer>
  )
}

