import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export const Mobile: React.FC = () => {
  const [ipAddress, setIpAdress] = useState()


  useEffect(() => {
    getExpenseAmount()
  }, [])

  const getExpenseAmount = async () => {
    const apiIp = await window.electron.ipcRenderer.invoke('get-ip-address')
    console.log(apiIp, 'Hey this is your ip address')
    setIpAdress(apiIp)
  }



  return (
    <div className={`flex w-full flex-row`} style={{ height: 'calc(100% - 1.75rem)' }}>
      <div className="w-full border-l border-border">
        <div className="overflow-y-scroll h-full p-4">
          <div className="flex flex-row justify-between pb-4 items-center">
            <h1 className="font-bold">Mobile App</h1>
          </div>
          <div>
            Mobile Api URL: {ipAddress}
          </div>
        </div>
      </div>
    </div>
  )
}
