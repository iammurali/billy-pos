/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react'
import { Input } from '../ui/input'

const SearchComponent = ({ data }: { data: MenuItem[] }): JSX.Element => {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<MenuItem[]>([])
  const [selectedItem, setSelectedItem] = useState<number | null>(null)

  const handleSearch = (e: any): void => {
    const term = e.target.value
    setSearchTerm(term)

    // Filter data based on the search term
    const filteredResults = data.filter((item) =>
      item.name.toLowerCase().includes(term.toLowerCase())
    )

    setSearchResults(filteredResults)
  }

  const handleItemClick = (index: number): void => {
    // Set the selected item based on index
    setSelectedItem(index)
    // Optionally, you can perform some action when an item is selected
    console.log('Selected Item:', searchResults[index])
  }

  return (
    <div className="relative">
      <Input
        className="w-full p-6 border border-border rounded-none"
        type="search"
        placeholder="Press space to start search or click on the input box"
        value={searchTerm}
        onChange={handleSearch}
      />
      {searchTerm !== '' && (
        <ul className="bg-background mt-[3px] absolute z-50 border border-border w-full">
          {searchResults.map((result, index) => (
            <li
              className={`p-2 hover:bg-zinc-500 cursor-pointer ${
                index === selectedItem ? 'bg-lightblue' : ''
              }`}
              key={index}
              onClick={() => handleItemClick(index)}
            >
              {result.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default SearchComponent
