import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllAnimes } from '../services/animeService'
import jsPDF from 'jspdf'
import { useAuth } from '../contexts/AuthContext'
import autoTable from 'jspdf-autotable'

export default function MisAnimes() {
    const [animes, setAnimes] = useState([])
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()
    const { isAdmin } = useAuth()

    // Estados de filtros
    const [searchQuery, setSearchQuery] = useState('')
    const [filters, setFilters] = useState({
        status: [], // COMPLETED, WATCHING, PLAN_TO_WATCH
        genres: [],
        preference: null // null, 'favorite', 'planned', 'disliked'
    })

    // Estado de ordenación
    const [sortBy, setSortBy] = useState('alphabetical')

    // Géneros únicos disponibles
    const [availableGenres, setAvailableGenres] = useState([])

    useEffect(() => {
        fetchAnimes()
    }, [])

    async function fetchAnimes() {
        try {
            const data = await getAllAnimes()
            setAnimes(data)

            // Extraer géneros únicos
            const genresSet = new Set()
            data.forEach(anime => {
                anime.genres?.forEach(genre => genresSet.add(genre))
            })
            setAvailableGenres(Array.from(genresSet).sort())
        } catch (error) {
            console.error('Error fetching animes:', error)
        } finally {
            setLoading(false)
        }
    }

    // Manejar cambios en filtros
    function toggleFilter(category, value) {
        setFilters(prev => {
            const current = prev[category]
            if (Array.isArray(current)) {
                const newValues = current.includes(value)
                    ? current.filter(v => v !== value)
                    : [...current, value]
                return { ...prev, [category]: newValues }
            }
            return prev
        })
    }

    function setPreferenceFilter(value) {
        setFilters(prev => ({
            ...prev,
            preference: prev.preference === value ? null : value
        }))
    }

    // Aplicar filtros
    const filteredAnimes = animes.filter(anime => {
        // Filtro por búsqueda de texto
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase()
            const titleMatch = anime.title?.toLowerCase().includes(query)
            const englishMatch = anime.title_english?.toLowerCase().includes(query)
            const romajiMatch = anime.title_romaji?.toLowerCase().includes(query)

            if (!titleMatch && !englishMatch && !romajiMatch) {
                return false
            }
        }

        // Filtro por estado
        if (filters.status.length > 0 && !filters.status.includes(anime.user_status)) {
            return false
        }

        // Filtro por géneros
        if (filters.genres && filters.genres.length > 0) {
            const hasGenre = filters.genres.some(g => anime.genres?.includes(g))
            if (!hasGenre) return false
        }

        // Filtro por preferencia
        if (filters.preference === 'favorite' && !anime.favorite) return false
        if (filters.preference === 'planned' && !anime.planned) return false
        if (filters.preference === 'disliked' && !anime.disliked) return false

        return true
    })

    // Aplicar ordenación
    const sortedAnimes = [...filteredAnimes].sort((a, b) => {
        switch (sortBy) {
            case 'alphabetical':
                return a.title.localeCompare(b.title)
            case 'alphabetical-desc':
                return b.title.localeCompare(a.title)
            case 'progress-asc':
                return parseFloat(a.progress_percentage) - parseFloat(b.progress_percentage)
            case 'progress-desc':
                return parseFloat(b.progress_percentage) - parseFloat(a.progress_percentage)
            case 'episodes-asc':
                return (a.episodes || 0) - (b.episodes || 0)
            case 'episodes-desc':
                return (b.episodes || 0) - (a.episodes || 0)
            case 'score-desc':
                return (b.user_score || 0) - (a.user_score || 0)
            case 'score-asc':
                return (a.user_score || 0) - (b.user_score || 0)
            case 'recent':
                return new Date(b.date_added) - new Date(a.date_added)
            case 'oldest':
                return new Date(a.date_added) - new Date(b.date_added)
            default:
                return 0
        }
    })

    // Exportar a PDF
    function exportToPDF() {
        const doc = new jsPDF()

        doc.setFontSize(18)
        doc.text('Mis Animes - AlokenList', 14, 20)

        doc.setFontSize(10)
        doc.text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, 14, 28)
        doc.text(`Total de animes: ${sortedAnimes.length}`, 14, 34)

        const tableData = sortedAnimes.map(anime => [
            anime.title,
            anime.user_status === 'COMPLETED' ? 'Completado' :
                anime.user_status === 'WATCHING' ? 'Viendo' : 'Por ver',
            `${anime.progress_percentage}%`,
            anime.episodes || 'N/A',
            anime.user_score ? `${anime.user_score}★` : '-',
            anime.favorite ? '❤' : anime.planned ? '📌' : anime.disliked ? '💔' : ''
        ])

        autoTable(doc, {
            startY: 40,
            head: [['Título', 'Estado', 'Progreso', 'Episodios', 'Puntuación', 'Pref']],
            body: tableData,
            styles: { fontSize: 8 },
            headStyles: { fillColor: [6, 182, 212] }
        })

        doc.save(`Mis-animes-${new Date().toISOString().split('T')[0]}.pdf`)
    }

    function clearAllFilters() {
        setSearchQuery('')
        setFilters({ status: [], genres: [], preference: null })
    }

    if (loading) {
        return <div className="text-white text-center mt-20">Cargando...</div>
    }

    return (
        <div>
            {/* Header con título y botón exportar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h1 className="text-3xl sm:text-4xl font-bold text-white">Mis Animes</h1>
                {isAdmin && (
                    <button
                        onClick={exportToPDF}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition flex items-center gap-2 whitespace-nowrap"
                    >
                        📄 Exportar PDF
                    </button>
                )}
            </div>

            {/* Barra de búsqueda destacada */}
            <div className="mb-6">
                <input
                    type="text"
                    placeholder="🔍 Buscar por título..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 text-lg"
                />
            </div>

            {/* Filtros y Ordenación */}
            <div className="bg-gray-800 rounded-lg p-4 mb-6 space-y-4">
                <div className="flex flex-wrap gap-4">
                    {/* Filtro: Estado */}
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-sm font-semibold text-gray-400 mb-2">Estado</label>
                        <div className="space-y-2">
                            {[
                                { value: 'WATCHING', label: 'En Proceso' },
                                { value: 'COMPLETED', label: 'Completado' },
                                { value: 'PLAN_TO_WATCH', label: 'Por Ver' }
                            ].map(option => (
                                <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={filters.status.includes(option.value)}
                                        onChange={() => toggleFilter('status', option.value)}
                                        className="w-4 h-4 rounded border-gray-600 text-cyan-500 focus:ring-cyan-500"
                                    />
                                    <span className="text-gray-300 text-sm">{option.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Filtro: Géneros */}
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-sm font-semibold text-gray-400 mb-2">Géneros</label>
                        <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                            {availableGenres.map(genre => (
                                <button
                                    key={genre}
                                    onClick={() => toggleFilter('genres', genre)}
                                    className={`px-3 py-1 rounded-full text-xs transition ${filters.genres?.includes(genre)
                                        ? 'bg-cyan-600 text-white'
                                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                        }`}
                                >
                                    {genre}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Filtro: Preferencias */}
                    <div className="flex-shrink-0 w-full sm:w-auto">
                        <label className="block text-sm font-semibold text-gray-400 mb-2">Preferencias</label>
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => setPreferenceFilter('favorite')}
                                className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${filters.preference === 'favorite'
                                    ? 'bg-red-600 text-white ring-2 ring-red-400'
                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                    }`}
                            >
                                ❤️ Favoritos
                            </button>
                            <button
                                onClick={() => setPreferenceFilter('planned')}
                                className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${filters.preference === 'planned'
                                    ? 'bg-purple-600 text-white ring-2 ring-purple-400'
                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                    }`}
                            >
                                📌 Planificados
                            </button>
                            <button
                                onClick={() => setPreferenceFilter('disliked')}
                                className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${filters.preference === 'disliked'
                                    ? 'bg-gray-900 text-white ring-2 ring-gray-600'
                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                    }`}
                            >
                                💔 Descartados
                            </button>
                        </div>
                    </div>
                </div>

                {/* Ordenación */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-4 border-t border-gray-700">
                    <label className="text-sm font-semibold text-gray-400 whitespace-nowrap">Ordenar por:</label>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="flex-1 w-full sm:w-auto px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    >
                        <option value="alphabetical">Alfabético (A-Z)</option>
                        <option value="alphabetical-desc">Alfabético (Z-A)</option>
                        <option value="progress-desc">Progreso (Mayor a Menor)</option>
                        <option value="progress-asc">Progreso (Menor a Mayor)</option>
                        <option value="episodes-desc">Más episodios</option>
                        <option value="episodes-asc">Menos episodios</option>
                        <option value="score-desc">Mejor puntuados</option>
                        <option value="score-asc">Peor puntuados</option>
                        <option value="recent">Añadidos recientemente</option>
                        <option value="oldest">Añadidos antiguos</option>
                    </select>

                    <div className="flex items-center gap-3 ml-auto">
                        <span className="text-gray-400 text-sm whitespace-nowrap">
                            {sortedAnimes.length} de {animes.length}
                        </span>
                        {(searchQuery || filters.status.length > 0 || filters.genres.length > 0 || filters.preference) && (
                            <button
                                onClick={clearAllFilters}
                                className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded transition"
                            >
                                Limpiar filtros
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Grid de animes */}
            {sortedAnimes.length === 0 ? (
                <div className="text-center mt-20">
                    <p className="text-gray-400 text-lg">
                        {searchQuery || filters.status.length > 0 || filters.genres.length > 0 || filters.preference
                            ? 'No hay animes que coincidan con los filtros'
                            : 'No tienes animes registrados aún'}
                    </p>
                    {(searchQuery || filters.status.length > 0 || filters.genres.length > 0 || filters.preference) && (
                        <button
                            onClick={clearAllFilters}
                            className="mt-4 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition"
                        >
                            Limpiar filtros
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
                    {sortedAnimes.map(anime => (
                        <div
                            key={anime.id}
                            onClick={() => navigate(`/anime/${anime.id}`)}
                            className="bg-gray-800 rounded-lg overflow-hidden hover:ring-2 hover:ring-cyan-400 transition cursor-pointer relative group"
                        >
                            {/* Badge de preferencia */}
                            <div className="absolute top-2 right-2 flex gap-1 z-10">
                                {anime.favorite && (
                                    <span className="text-2xl drop-shadow-lg">❤️</span>
                                )}
                                {anime.planned && (
                                    <span className="text-2xl drop-shadow-lg">📌</span>
                                )}
                                {anime.disliked && (
                                    <span className="text-2xl drop-shadow-lg">💔</span>
                                )}
                            </div>

                            <img
                                src={anime.cover_image || 'https://via.placeholder.com/230x345'}
                                alt={anime.title}
                                className="w-full h-64 sm:h-72 object-cover"
                            />
                            <div className="p-3 sm:p-4">
                                <h3 className="text-white font-semibold truncate mb-2 text-sm sm:text-base">
                                    {anime.title}
                                </h3>
                                <div className="flex items-center justify-between text-xs sm:text-sm mb-2">
                                    <span className="text-yellow-400">
                                        {anime.user_score ? '★'.repeat(Math.round(anime.user_score)) : '☆☆☆☆☆'}
                                    </span>
                                    <span className="text-cyan-400 font-bold">{anime.progress_percentage}%</span>
                                </div>
                                <div className="bg-gray-700 rounded-full h-2">
                                    <div
                                        className="bg-cyan-500 h-2 rounded-full transition-all"
                                        style={{ width: `${anime.progress_percentage}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}