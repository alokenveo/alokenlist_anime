import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import SeasonAccordion from '../components/anime/SeasonAccordion'
import EpisodeModal from '../components/anime/EpisodeModal'
import { getAnimeWithDetails } from '../services/animeService'

function AnimeDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [anime, setAnime] = useState(null)
    const [loading, setLoading] = useState(true)
    const [selectedEpisode, setSelectedEpisode] = useState(null)
    const { isAdmin } = useAuth()
    useEffect(() => {
        fetchAnimeDetail()
    }, [id])

    async function fetchAnimeDetail() {
        try {
            const data = await getAnimeWithDetails(id)
            setAnime(data)
        } catch (error) {
            console.error('Error fetching anime detail:', error)
        } finally {
            setLoading(false)
        }
    }

    function handleEpisodeClick(episode) {
        setSelectedEpisode(episode)
    }

    function handleCloseModal() {
        setSelectedEpisode(null)
    }

    function handleEpisodeUpdate() {
        setSelectedEpisode(null)
        fetchAnimeDetail()
    }

    async function togglePreference(preferenceType) {
        try {
            // Determinar el nuevo estado
            let updates = {}

            if (preferenceType === 'favorite') {
                updates = {
                    favorite: !anime.favorite,
                    disliked: false,
                    planned: false
                }
            } else if (preferenceType === 'disliked') {
                updates = {
                    favorite: false,
                    disliked: !anime.disliked,
                    planned: false
                }
            } else if (preferenceType === 'planned') {
                updates = {
                    favorite: false,
                    disliked: false,
                    planned: !anime.planned
                }
            }

            const { error } = await supabase
                .from('animes')
                .update(updates)
                .eq('id', anime.id)

            if (error) throw error

            setAnime({ ...anime, ...updates })
        } catch (error) {
            console.error('Error toggling preference:', error)
        }
    }

    if (loading) {
        return <div className="text-white text-center mt-20">Cargando...</div>
    }

    if (!anime) {
        return (
            <div className="text-white text-center mt-20">
                <p className="text-xl">Anime no encontrado</p>
                <button
                    onClick={() => navigate('/')}
                    className="mt-4 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 rounded-lg transition"
                >
                    Volver al Dashboard
                </button>
            </div>
        )
    }

    return (
        <div className="text-white pb-8">
            {/* Header con banner */}
            {anime.banner_image && (
                <div
                    className="w-full h-48 sm:h-64 md:h-80 bg-cover bg-center rounded-lg mb-4 sm:mb-6"
                    style={{ backgroundImage: `url(${anime.banner_image})` }}
                />
            )}

            {/* Botón volver */}
            <button
                onClick={() => navigate('/')}
                className="mb-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition text-sm sm:text-base"
            >
                ← Volver
            </button>

            {/* Contenido principal */}
            <div className="flex flex-col md:flex-row gap-6">
                {/* Poster */}
                <div className="flex-shrink-0 mx-auto md:mx-0">
                    <img
                        src={anime.cover_image || 'https://via.placeholder.com/230x345'}
                        alt={anime.title}
                        className="w-48 sm:w-56 md:w-64 rounded-lg shadow-xl"
                    />
                </div>

                {/* Info */}
                <div className="flex-1">
                    {/* Título */}
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">{anime.title}</h1>

                    {anime.title_english && anime.title_english !== anime.title && (
                        <p className="text-lg sm:text-xl text-gray-400 mb-4">{anime.title_english}</p>
                    )}


                    {/* Botones de preferencia - SOLO ADMIN */}
                    {isAdmin && (
                        <div className="flex flex-wrap gap-3 mb-6">
                            <button
                                onClick={() => togglePreference('favorite')}
                                className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${anime.favorite
                                        ? 'bg-red-600 text-white ring-2 ring-red-400 scale-105'
                                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                    }`}
                            >
                                <span className="text-xl">{anime.favorite ? '❤️' : '🤍'}</span>
                                <span className="text-sm sm:text-base">Me gusta</span>
                            </button>

                            <button
                                onClick={() => togglePreference('planned')}
                                className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${anime.planned
                                        ? 'bg-purple-600 text-white ring-2 ring-purple-400 scale-105'
                                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                    }`}
                            >
                                <span className="text-xl">📌</span>
                                <span className="text-sm sm:text-base">Planificado</span>
                            </button>

                            <button
                                onClick={() => togglePreference('disliked')}
                                className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${anime.disliked
                                        ? 'bg-gray-900 text-white ring-2 ring-gray-600 scale-105'
                                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                    }`}
                            >
                                <span className="text-xl">💔</span>
                                <span className="text-sm sm:text-base">No me gusta</span>
                            </button>
                        </div>
                    )}

                    {/* Mostrar estado de preferencia si NO es admin */}
                    {!isAdmin && (anime.favorite || anime.planned || anime.disliked) && (
                        <div className="mb-6 flex gap-2">
                            {anime.favorite && (
                                <span className="px-4 py-2 bg-red-600/20 text-red-400 rounded-lg flex items-center gap-2">
                                    ❤️ Favorito
                                </span>
                            )}
                            {anime.planned && (
                                <span className="px-4 py-2 bg-purple-600/20 text-purple-400 rounded-lg flex items-center gap-2">
                                    📌 Planificado
                                </span>
                            )}
                            {anime.disliked && (
                                <span className="px-4 py-2 bg-gray-700 text-gray-400 rounded-lg flex items-center gap-2">
                                    💔 Descartado
                                </span>
                            )}
                        </div>
                    )}

                    {/* Badges */}
                    <div className="flex flex-wrap gap-2 mb-6">
                        <span className="px-3 py-1 bg-cyan-600 rounded-full text-xs sm:text-sm">{anime.format}</span>
                        <span className="px-3 py-1 bg-purple-600 rounded-full text-xs sm:text-sm">{anime.status}</span>
                        {anime.season && (
                            <span className="px-3 py-1 bg-orange-600 rounded-full text-xs sm:text-sm">
                                {anime.season} {anime.season_year}
                            </span>
                        )}
                    </div>

                    {/* Géneros */}
                    <div className="mb-4">
                        <h3 className="text-lg sm:text-xl font-semibold mb-2">Géneros</h3>
                        <div className="flex gap-2 flex-wrap">
                            {anime.genres?.map(genre => (
                                <span key={genre} className="px-3 py-1 bg-gray-700 rounded-full text-xs sm:text-sm">
                                    {genre}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Sinopsis */}
                    <div className="mb-4">
                        <h3 className="text-lg sm:text-xl font-semibold mb-2">Sinopsis</h3>
                        <p className="text-sm sm:text-base text-gray-300 leading-relaxed">{anime.description}</p>
                    </div>

                    {/* Grid de estadísticas */}
                    <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6">
                        <div className="bg-gray-800 p-3 sm:p-4 rounded-lg">
                            <p className="text-gray-400 text-xs sm:text-sm">Episodios</p>
                            <p className="text-xl sm:text-2xl font-bold">{anime.episodes || 'N/A'}</p>
                        </div>
                        <div className="bg-gray-800 p-3 sm:p-4 rounded-lg">
                            <p className="text-gray-400 text-xs sm:text-sm">Duración</p>
                            <p className="text-xl sm:text-2xl font-bold">{anime.duration ? `${anime.duration} min` : 'N/A'}</p>
                        </div>
                        <div className="bg-gray-800 p-3 sm:p-4 rounded-lg">
                            <p className="text-gray-400 text-xs sm:text-sm">Tu Progreso</p>
                            <p className="text-xl sm:text-2xl font-bold text-cyan-400">{anime.progress_percentage}%</p>
                        </div>
                        <div className="bg-gray-800 p-3 sm:p-4 rounded-lg">
                            <p className="text-gray-400 text-xs sm:text-sm">Tu Puntuación</p>
                            <p className="text-xl sm:text-2xl font-bold text-yellow-400">
                                {anime.user_score ? `${anime.user_score} ★` : 'Sin puntuar'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Temporadas y Episodios */}
            {anime.seasons && anime.seasons.length > 0 && (
                <div className="mt-8">
                    <h3 className="text-xl sm:text-2xl font-bold mb-4">Temporadas y Episodios</h3>
                    {anime.seasons.map((season) => (
                        <SeasonAccordion
                            key={season.id}
                            season={season}
                            onEpisodeClick={handleEpisodeClick}
                            onSeasonUpdate={fetchAnimeDetail}
                        />
                    ))}
                </div>
            )}

            {/* Modal de episodio */}
            {selectedEpisode && (
                <EpisodeModal
                    episode={selectedEpisode}
                    onClose={handleCloseModal}
                    onUpdate={handleEpisodeUpdate}
                />
            )}
        </div>
    )
}

export default AnimeDetail