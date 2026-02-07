import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import AnimeDetail from './pages/AnimeDetail'
import MisAnimes from './pages/MisAnimes'
import SobreMi from './pages/SobreMi'
import { useState } from 'react'

function App() {
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleAnimeAdded = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  return (
    <AuthProvider>
      <Router>
        <Layout onAnimeAdded={handleAnimeAdded}>
          <Routes>
            <Route path="/" element={<Dashboard refreshTrigger={refreshTrigger} />} />
            <Route path="/mis-animes" element={<MisAnimes />} />
            <Route path="/sobre-mi" element={<SobreMi />} />
            <Route path="/anime/:id" element={<AnimeDetail />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  )
}

export default App