/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from 'react'
import { Input } from '../ui/input'
import { IMenuItem } from 'src/types/sharedTypes'
import { Search } from 'lucide-react'

const SearchComponent = ({
  data,
  addItemToBill
}: {
  data: MenuItem[]
  addItemToBill: (item: IMenuItem) => void
}): JSX.Element => {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<MenuItem[]>([])
  const [selectedItem, setSelectedItem] = useState<number | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }

    // Add event listener for keydown event
    document.addEventListener('keydown', handleGlobalKeyDown)

    // Cleanup function to remove the event listener when the component unmounts
    return () => {
      document.removeEventListener('keydown', handleGlobalKeyDown)
    }
  }, [])

  const handleGlobalKeyDown = (event: KeyboardEvent) => {
    // Check if the pressed key is space and the focus is not on the input field
    if (event.key === ' ' && document.activeElement !== inputRef.current) {
      event.preventDefault() // Prevent default behavior of space key
      inputRef.current?.focus() // Focus on the input field
    }
  }

  const handleSearch = (e: any): void => {
    const term = e.target.value
    setSearchTerm(term)

    // Filter data based on the search term
    const filteredResults = data
      .filter((item) => {
        const hasShortCode = item.short_code?.toLowerCase() === term.toLowerCase()
        const includesTitle = item.title.toLowerCase().includes(term.toLowerCase())
        return hasShortCode || includesTitle
      })
      .sort((a, b) => {
        const aHasShortCode = a.short_code?.toLowerCase() === term.toLowerCase()
        const bHasShortCode = b.short_code?.toLowerCase() === term.toLowerCase()
        if (aHasShortCode && !bHasShortCode) return -1
        if (!aHasShortCode && bHasShortCode) return 1
        return 0
      })

    setSearchResults(filteredResults)
    setSelectedItem(0)
  }

  const handleItemClick = (index: number): void => {
    // Set the selected item based on index
    setSelectedItem(index)
    // Optionally, you can perform some action when an item is selected
    console.log('Selected Item:', searchResults[index])
    addItemToBill(searchResults[index] as IMenuItem)
    setSearchTerm('')
    setSelectedItem(0)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedItem((prevSelectedItem) => {
        if (prevSelectedItem === null || prevSelectedItem === searchResults.length - 1) {
          return 0
        } else {
          return prevSelectedItem + 1
        }
      })
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedItem((prevSelectedItem) => {
        if (prevSelectedItem === null || prevSelectedItem === 0) {
          return searchResults.length - 1
        } else {
          return prevSelectedItem - 1
        }
      })
    } else if (e.key === 'Enter' && selectedItem !== null) {
      console.log('selected item', selectedItem)
      handleItemClick(selectedItem)
      setSelectedItem(0)
    }
  }

  return (
    <div className="relative">
      <div className="relative ml-auto flex-1 md:grow-0">
      <Search className="absolute left-2.5 top-4 h-4 w-4 text-primary" />
      <Input
        
        className="w-full px-8 py-6 border border-border rounded-none"
        type="search"
        placeholder="Press space to start search or click on the input box"
        value={searchTerm}
        onChange={handleSearch}
        onKeyDown={handleKeyDown}
        ref={inputRef}
      />
      </div>
      {searchTerm !== '' && (
        <ul className="bg-background mt-[3px] absolute z-50 border border-border w-full max-h-[88vh] overflow-y-auto">
          {searchResults.map((result, index) => (
            <li
              className={`p-2 hover:bg-zinc-500 cursor-pointer flex justify-between border ${
                index === selectedItem ? 'bg-secondary' : ''
              }`}
              key={index}
              onClick={() => handleItemClick(index)}
            >
              <div>
              {result.title}{`${result.short_code? ` (short code: ${result.short_code})` : ''}`}
              </div>
              <div>
                Rs.{result.price}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default SearchComponent
