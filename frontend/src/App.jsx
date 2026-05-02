import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { SelectedItemsContext } from './pages/Search'
import Layout from './components/Layout'
import Home from './pages/Home'
import Destination from './pages/Destination'
import Details from './pages/Details'
import Interests from './pages/Interests'
import Search from './pages/Search'
import Review from './pages/Review'
import Itinerary from './pages/Itinerary'

function App() {
  const [selectedItems, setSelectedItems] = useState([])

  function toggleItem(item) {
    setSelectedItems((prev) => {
      const exists = prev.find((s) => s.id === item.id)
      if (exists) return prev.filter((s) => s.id !== item.id)
      return [...prev, item]
    })
  }

  function removeItem(id) {
    setSelectedItems((prev) => prev.filter((s) => s.id !== id))
  }

  return (
    <BrowserRouter>
      <SelectedItemsContext.Provider value={{ selectedItems, toggleItem, removeItem }}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="destination" element={<Destination />} />
            <Route path="details" element={<Details />} />
            <Route path="interests" element={<Interests />} />
            <Route path="search" element={<Search />} />
            <Route path="review" element={<Review />} />
            <Route path="itinerary" element={<Itinerary />} />
          </Route>
        </Routes>
      </SelectedItemsContext.Provider>
    </BrowserRouter>
  )
}

export default App
