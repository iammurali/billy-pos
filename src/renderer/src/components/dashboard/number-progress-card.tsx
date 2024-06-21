import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/ui/card'
import { Progress } from '@/ui/progress'

export default function NumberCardWithProgress({
  title,
  saleAmount,
  percentageChange,
  progress
}: {
  title?: string
  saleAmount?: number
  percentageChange?: string
  progress?: number
}) {
  console.log(progress ? (progress / 100) * 100 : 0, 'Hello per')
  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardDescription>{title ? title : 'This month sales'}</CardDescription>
        <CardTitle className="text-4xl">₹ {saleAmount ? saleAmount : 0}</CardTitle>
      </CardHeader>
      <CardContent>
        {
          progress ? (
            <Progress
              value={progress}
              aria-label={`${percentageChange}% change`}
              max={100}
            />
          ) : null
        }
      </CardContent>
      <CardFooter>
        <div className="text-xs text-muted-foreground">{percentageChange}</div>
      </CardFooter>
    </Card>
  )
}
