import { useState, useEffect, useRef } from 'react';
import { searchAnime } from '../../services/tmdbService';
import { addAnimeToDatabase } from '../../services/animeService';

function SearchBar({ onAnimeAdded }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [addingId, setAddingId] = useState(null);
  const searchRef = useRef(null);

  // Cerrar resultados al hacer click fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Buscar cuando el query tenga 3+ caracteres
  useEffect(() => {
    if (query.length >= 3) {
      const timeoutId = setTimeout(async () => {
        setLoading(true);
        try {
          const data = await searchAnime(query);
          setResults(data);
          setShowResults(true);
        } catch (error) {
          console.error('Error searching:', error);
        } finally {
          setLoading(false);
        }
      }, 300); // Debounce de 300ms

      return () => clearTimeout(timeoutId);
    } else {
      setResults([]);
      setShowResults(false);
    }
  }, [query]);

  async function handleAddAnime(anime) {
    setAddingId(anime.id);
    try {
      await addAnimeToDatabase(anime);
      alert(`¡${anime.title.romaji || anime.title.english} añadido correctamente!`);
      setQuery('');
      setShowResults(false);
      if (onAnimeAdded) onAnimeAdded();
    } catch (error) {
      alert(error.message || 'Error al añadir el anime');
    } finally {
      setAddingId(null);
    }
  }

  return (
    <div ref={searchRef} className="relative w-96">
      <input
        type="text"
        placeholder="Buscar anime..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
      />

      {/* Resultados */}
      {showResults && (
        <div className="absolute top-full mt-2 w-full bg-gray-800 border border-gray-700 rounded-lg shadow-xl max-h-96 overflow-y-auto z-50">
          {loading ? (
            <div className="p-4 text-center text-gray-400">Buscando...</div>
          ) : results.length === 0 ? (
            <div className="p-4 text-center text-gray-400">No se encontraron resultados</div>
          ) : (
            results.map((anime) => (
              <div
                key={anime.id}
                className="flex gap-3 p-3 border-b border-gray-700 hover:bg-gray-700 transition"
              >
                {/* Columna 1: Imagen */}
                <div className="flex-shrink-0">
                  <img
                    src={anime.coverImage?.large || 'https://via.placeholder.com/80x120'}
                    alt={anime.title.romaji}
                    className="w-20 h-28 object-cover rounded"
                  />
                </div>

                {/* Columna 2: Título y Sinopsis */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-semibold truncate">
                    {anime.title.romaji || anime.title.english}
                  </h4>
                  <p className="text-xs text-gray-400 line-clamp-3 mt-1">
                    {anime.description?.replace(/<[^>]*>/g, '') || 'Sin descripción'}
                  </p>
                </div>

                {/* Columna 3: Puntuación y Botón */}
                <div className="flex flex-col items-end justify-between flex-shrink-0">
                  <div className="text-yellow-400 font-semibold text-sm">
                    ⭐ {anime.averageScore ? (anime.averageScore / 20).toFixed(1) : 'N/A'}
                  </div>
                  <button
                    onClick={() => handleAddAnime(anime)}
                    disabled={addingId === anime.id}
                    className="px-3 py-1 bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-600 text-white text-sm rounded transition"
                  >
                    {addingId === anime.id ? '...' : 'Añadir'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default SearchBar;