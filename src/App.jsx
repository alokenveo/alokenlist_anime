import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import AnimeDetail from './pages/AnimeDetail'
import { useState } from 'react'

function App() {
const [refreshTrigger, setRefreshTrigger] = useState(0)

const handleAnimeAdded = () => {
  setRefreshTrigger(prev => prev + 1)
}

  return (
    <Router>
      <Layout onAnimeAdded={handleAnimeAdded}>
        <Routes>
          <Route path="/" element={<Dashboard refreshTrigger={refreshTrigger} />} />
          <Route path="/anime/:id" element={<AnimeDetail />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App