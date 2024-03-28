import React, { useState } from 'react'

type MenuItem = {
  name: string
  category: string
  price: string
}

const ManageMenu: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [form, setForm] = useState<MenuItem>({ name: '', category: '', price: '' })

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault()
    setMenuItems([...menuItems, form])
    setForm({ name: '', category: '', price: '' })
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <h1 className="text-6xl mb-4 text-blue-500">Manage Menu Page</h1>
      <form onSubmit={handleSubmit} className="mb-4">
        <input
          type="text"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="shadow-lg p-2 mb-2 bg-gray-800 text-white rounded"
        />
        <input
          type="text"
          placeholder="Category"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          className="shadow-lg p-2 mb-2 bg-gray-800 text-white rounded"
        />
        <input
          type="text"
          placeholder="Price"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          className="shadow-lg p-2 mb-2 bg-gray-800 text-white rounded"
        />
        {/* Add more input fields and modify as needed */}
        <button type="submit" className="bg-blue-500 p-2 rounded">
          Add Item
        </button>
      </form>
      <table className="w-full bg-gray-800 rounded">
        <thead>
          <tr>
            <th className="border p-2">Name</th>
            <th className="border p-2">Category</th>
            <th className="border p-2">Price</th>
          </tr>
        </thead>
        <tbody>
          {menuItems.map((item, index) => (
            <tr key={index}>
              <td className="border p-2">{item.name}</td>
              <td className="border p-2">{item.category}</td>
              <td className="border p-2">{item.price}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default ManageMenu
