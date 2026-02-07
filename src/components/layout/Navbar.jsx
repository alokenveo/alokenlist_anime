import { Link } from 'react-router-dom'
import SearchBar from '../common/SearchBar'

export default function Navbar({ onAnimeAdded }) {
  return (
    <nav className="bg-gray-800 border-b border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition">
          <img src="/logo.png" alt="AlokenList Anime" className="h-10" />
          <h1 className="text-xl font-bold text-cyan-400">AlokenList Anime</h1>
        </Link>

        {/* SearchBar centrado */}
        <div className="flex-1 flex justify-center px-8">
          <SearchBar onAnimeAdded={onAnimeAdded} />
        </div>

        {/* Enlaces de navegación */}
        <div className="flex items-center gap-6">
          <Link
            to="/mis-animes"
            className="text-gray-300 hover:text-cyan-400 font-medium transition"
          >
            Mis Animes
          </Link>
          <Link
            to="/sobre-mi"
            className="text-gray-300 hover:text-cyan-400 font-medium transition"
          >
            Sobre Mí
          </Link>
        </div>
      </div>
    </nav>
  )
}