import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAnimesPaginated, getAllAnimesFiltered, getAvailableGenres } from '../services/animeService'
import jsPDF from 'jspdf'
import { useAuth } from '../contexts/AuthContext'
import autoTable from 'jspdf-autotable'

const ITEMS_PER_PAGE = 24

export default function MisAnimes() {
    const navigate = useNavigate()
    const { isAdmin } = useAuth()

    // Datos de la página actual
    const [animes, setAnimes] = useState([])
    const [totalCount, setTotalCount] = useState(0)
    const [loading, setLoading] = useState(true)

    // Géneros disponibles (se cargan una sola vez)
    const [availableGenres, setAvailableGenres] = useState([])

    // Filtros
    const [searchQuery, setSearchQuery] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')
    const [filters, setFilters] = useState({
        status: [],
        genres: [],
        preference: null
    })
    const [sortBy, setSortBy] = useState('alphabetical')

    // Paginación
    const [currentPage, setCurrentPage] = useState(1)
    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)

    // Debounce para el buscador
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery)
            setCurrentPage(1)
        }, 400)
        return () => clearTimeout(timer)
    }, [searchQuery])

    // Cargar géneros al montar
    useEffect(() => {
        getAvailableGenres().then(setAvailableGenres)
    }, [])

    // Fetch de la página actual
    const fetchPage = useCallback(async () => {
        setLoading(true)
        try {
            const { data, count } = await getAnimesPaginated({
                page: currentPage,
                pageSize: ITEMS_PER_PAGE,
                searchQuery: debouncedSearch,
                filters,
                sortBy
            })
            setAnimes(data || [])
            setTotalCount(count || 0)
        } catch (error) {
            console.error('Error fetching animes:', error)
        } finally {
            setLoading(false)
        }
    }, [currentPage, debouncedSearch, filters, sortBy])

    useEffect(() => {
        fetchPage()
    }, [fetchPage])

    // Reset de página al cambiar filtros u ordenación
    function handleFilterChange(updaterFn) {
        updaterFn()
        setCurrentPage(1)
    }

    function toggleFilter(category, value) {
        handleFilterChange(() =>
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
        )
    }

    function setPreferenceFilter(value) {
        handleFilterChange(() =>
            setFilters(prev => ({
                ...prev,
                preference: prev.preference === value ? null : value
            }))
        )
    }

    function clearAllFilters() {
        setSearchQuery('')
        setDebouncedSearch('')
        setFilters({ status: [], genres: [], preference: null })
        setCurrentPage(1)
    }

    // Exportar a PDF (trae TODOS los animes filtrados, sin paginación)
    async function exportToPDF() {
        const doc = new jsPDF()
        doc.setFontSize(18)
        doc.text('Mis Animes - AlokenList', 14, 20)
        doc.setFontSize(10)
        doc.text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, 14, 28)

        const allFiltered = await getAllAnimesFiltered({ searchQuery: debouncedSearch, filters, sortBy })

        doc.text(`Total de animes: ${allFiltered.length}`, 14, 34)

        const tableData = allFiltered.map(anime => [
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

    const hasActiveFilters = searchQuery || filters.status.length > 0 || filters.genres.length > 0 || filters.preference

    return (
        <div>
            {/* Header */}
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

            {/* Buscador */}
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
                    {/* Estado */}
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

                    {/* Géneros */}
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

                    {/* Preferencias */}
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

                {/* Ordenación + contador */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-4 border-t border-gray-700">
                    <label className="text-sm font-semibold text-gray-400 whitespace-nowrap">Ordenar por:</label>
                    <select
                        value={sortBy}
                        onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1) }}
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
                            {totalCount} anime{totalCount !== 1 ? 's' : ''}
                        </span>
                        {hasActiveFilters && (
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
            {loading ? (
                <div className="flex justify-center items-center mt-20">
                    <div className="w-10 h-10 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : animes.length === 0 ? (
                <div className="text-center mt-20">
                    <p className="text-gray-400 text-lg">
                        {hasActiveFilters
                            ? 'No hay animes que coincidan con los filtros'
                            : 'No tienes animes registrados aún'}
                    </p>
                    {hasActiveFilters && (
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
                    {animes.map(anime => (
                        <div
                            key={anime.id}
                            onClick={() => navigate(`/anime/${anime.id}`)}
                            className="bg-gray-800 rounded-lg overflow-hidden hover:ring-2 hover:ring-cyan-400 transition cursor-pointer relative group"
                        >
                            {/* Badge de preferencia */}
                            <div className="absolute top-2 right-2 flex gap-1 z-10">
                                {anime.favorite && <span className="text-2xl drop-shadow-lg">❤️</span>}
                                {anime.planned && <span className="text-2xl drop-shadow-lg">📌</span>}
                                {anime.disliked && <span className="text-2xl drop-shadow-lg">💔</span>}
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

            {/* Paginación */}
            {!loading && totalPages > 1 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            )}
        </div>
    )
}

// Componente de paginación
function Pagination({ currentPage, totalPages, onPageChange }) {
    // Generar array de páginas visibles (máx 5)
    function getPageNumbers() {
        const delta = 2
        const range = []
        const left = Math.max(1, currentPage - delta)
        const right = Math.min(totalPages, currentPage + delta)

        for (let i = left; i <= right; i++) range.push(i)

        if (left > 1) {
            if (left > 2) range.unshift('...')
            range.unshift(1)
        }
        if (right < totalPages) {
            if (right < totalPages - 1) range.push('...')
            range.push(totalPages)
        }

        return range
    }

    function scrollTop() {
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    function changePage(page) {
        onPageChange(page)
        scrollTop()
    }

    return (
        <div className="flex justify-center items-center gap-2 mt-10 mb-6 flex-wrap">
            <button
                onClick={() => changePage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 rounded-lg bg-gray-700 text-white disabled:opacity-30 hover:bg-gray-600 transition text-sm"
            >
                ← Anterior
            </button>

            {getPageNumbers().map((page, idx) =>
                page === '...' ? (
                    <span key={`ellipsis-${idx}`} className="px-2 text-gray-400 select-none">…</span>
                ) : (
                    <button
                        key={page}
                        onClick={() => changePage(page)}
                        className={`w-9 h-9 rounded-lg text-sm font-semibold transition ${currentPage === page
                            ? 'bg-cyan-500 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                    >
                        {page}
                    </button>
                )
            )}

            <button
                onClick={() => changePage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 rounded-lg bg-gray-700 text-white disabled:opacity-30 hover:bg-gray-600 transition text-sm"
            >
                Siguiente →
            </button>
        </div>
    )
}