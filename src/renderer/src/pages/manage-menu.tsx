import React, { useState } from 'react'

type MenuItem = {
  name: string
  category: string
  price: string
}

const ManageMenu: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])


  return (
    <div className={`flex w-full flex-row`} style={{ height: 'calc(100% - 1.75rem)' }}>

    </div>
  )
}

export default ManageMenu
