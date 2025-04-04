import { useEffect, useState } from 'react'

export const Mobile: React.FC = () => {
  useEffect(() => {}, [])

  return (
    <div className={`flex w-full flex-row`} style={{ height: 'calc(100% - 1.75rem)' }}>
      <div className="w-full border-l border-border">
        <div className="overflow-y-scroll h-full p-4">
          <div className="flex flex-row justify-between pb-4 items-center">
            <h1 className="font-bold">Mobile App</h1>
          </div>
          <div>
            Coming soon...
          </div>
        </div>
      </div>
    </div>
  )
}
