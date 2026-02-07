import { Link } from 'react-router-dom'
import { useState } from 'react'
import SearchBar from '../common/SearchBar'
import LoginModal from '../auth/LoginModal'
import { useAuth } from '../../contexts/AuthContext'

export default function Navbar({ onAnimeAdded }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  const { isAdmin, signOut } = useAuth()

  async function handleLogout() {
    try {
      await signOut()
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    }
  }

  return (
    <>
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 flex-shrink-0">
              <img src="/logo.png" alt="AlokenList" className="h-8 sm:h-10" />
              <h1 className="text-lg sm:text-xl font-bold text-cyan-400 hidden sm:block">
                AlokenList Anime
              </h1>
            </Link>

            {/* SearchBar - Desktop (solo si es admin) */}
            {isAdmin && (
              <div className="hidden md:flex flex-1 justify-center px-4 max-w-2xl">
                <SearchBar onAnimeAdded={onAnimeAdded} />
              </div>
            )}

            {/* Enlaces - Desktop */}
            <div className="hidden md:flex items-center gap-6">
              <Link
                to="/mis-animes"
                className="text-gray-300 hover:text-cyan-400 font-medium transition whitespace-nowrap"
              >
                Mis Animes
              </Link>
              <Link
                to="/sobre-mi"
                className="text-gray-300 hover:text-cyan-400 font-medium transition whitespace-nowrap"
              >
                Sobre Mí
              </Link>

              {/* Botón Login/Logout */}
              {isAdmin ? (
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition text-sm font-medium"
                >
                  Cerrar Sesión
                </button>
              ) : (
                <button
                  onClick={() => setLoginModalOpen(true)}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition text-sm font-medium"
                >
                  🔒 Admin
                </button>
              )}
            </div>

            {/* Botón hamburguesa - Mobile */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 transition"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Menú Mobile */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-gray-800 border-t border-gray-700">
            <div className="px-4 py-4 space-y-4">
              {/* SearchBar Mobile (solo si es admin) */}
              {isAdmin && (
                <SearchBar onAnimeAdded={() => {
                  onAnimeAdded()
                  setMobileMenuOpen(false)
                }} />
              )}

              {/* Enlaces Mobile */}
              <div className="flex flex-col space-y-2 pt-2">
                <Link
                  to="/mis-animes"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700 transition"
                >
                  Mis Animes
                </Link>
                <Link
                  to="/sobre-mi"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700 transition"
                >
                  Sobre Mí
                </Link>

                {/* Botón Login/Logout Mobile */}
                {isAdmin ? (
                  <button
                    onClick={() => {
                      handleLogout()
                      setMobileMenuOpen(false)
                    }}
                    className="w-full px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition text-base font-medium"
                  >
                    Cerrar Sesión
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setLoginModalOpen(true)
                      setMobileMenuOpen(false)
                    }}
                    className="w-full px-3 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-md transition text-base font-medium"
                  >
                    🔒 Modo Admin
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Modal de Login */}
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
      />
    </>
  )
}