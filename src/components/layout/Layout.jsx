import { useState } from 'react'
import Navbar from './Navbar'
import Sidebar from './Sidebar'

function Layout({ children, onAnimeAdded }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar onAnimeAdded={onAnimeAdded} />
      <div className="flex">
        <Sidebar isOpen={sidebarOpen} />
        <main className={`flex-1 p-6 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout