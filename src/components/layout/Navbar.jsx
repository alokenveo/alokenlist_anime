import SearchBar from '../common/SearchBar';

function Navbar({onAnimeAdded}) {
  return (
    <nav className="bg-gray-800 border-b border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img src="/logo.png" alt="AlokenList Anime" className="h-10" />
          <h1 className="text-2xl font-bold text-cyan-400">AlokenList Anime</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <SearchBar onAnimeAdded={onAnimeAdded} />
          <button className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition">
            Configuración
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar