import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Destination from './pages/Destination'
import Details from './pages/Details'
import Interests from './pages/Interests'
import Itinerary from './pages/Itinerary'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="destination" element={<Destination />} />
          <Route path="details" element={<Details />} />
          <Route path="interests" element={<Interests />} />
          <Route path="itinerary" element={<Itinerary />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
