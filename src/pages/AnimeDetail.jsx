import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import SeasonAccordion from '../components/anime/SeasonAccordion'
import EpisodeModal from '../components/anime/EpisodeModal'
import { getAnimeWithDetails } from '../services/animeService'

function AnimeDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [anime, setAnime] = useState(null)
    const [loading, setLoading] = useState(true)
    const [selectedEpisode, setSelectedEpisode] = useState(null)

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

    async function toggleFavorite() {
        try {
            const { error } = await supabase
                .from('animes')
                .update({ favorite: !anime.favorite })
                .eq('id', anime.id)

            if (error) throw error

            setAnime({ ...anime, favorite: !anime.favorite })
        } catch (error) {
            console.error('Error toggling favorite:', error)
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
        <div className="text-white">
            {/* Header con banner */}
            {anime.banner_image && (
                <div
                    className="w-full h-64 bg-cover bg-center rounded-lg mb-6"
                    style={{ backgroundImage: `url(${anime.banner_image})` }}
                />
            )}

            {/* Botón volver */}
            <button
                onClick={() => navigate('/')}
                className="mb-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
            >
                ← Volver
            </button>

            {/* Contenido principal */}
            <div className="flex gap-6">
                {/* Poster */}
                <div className="flex-shrink-0">
                    <img
                        src={anime.cover_image || 'https://via.placeholder.com/230x345'}
                        alt={anime.title}
                        className="w-64 rounded-lg shadow-xl"
                    />
                </div>

                {/* Info */}
                <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                        <h1 className="text-4xl font-bold">{anime.title}</h1>
                        <button
                            onClick={toggleFavorite}
                            className="text-3xl transition-transform hover:scale-110"
                        >
                            {anime.favorite ? '❤️' : '🤍'}
                        </button>
                    </div>
                    {anime.title_english && (
                        <p className="text-xl text-gray-400 mb-4">{anime.title_english}</p>
                    )}

                    <div className="flex gap-4 mb-6">
                        <span className="px-3 py-1 bg-cyan-600 rounded-full text-sm">{anime.format}</span>
                        <span className="px-3 py-1 bg-purple-600 rounded-full text-sm">{anime.status}</span>
                        {anime.season && (
                            <span className="px-3 py-1 bg-orange-600 rounded-full text-sm">
                                {anime.season} {anime.season_year}
                            </span>
                        )}
                    </div>

                    <div className="mb-4">
                        <h3 className="text-xl font-semibold mb-2">Géneros</h3>
                        <div className="flex gap-2 flex-wrap">
                            {anime.genres?.map(genre => (
                                <span key={genre} className="px-3 py-1 bg-gray-700 rounded-full text-sm">
                                    {genre}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="mb-4">
                        <h3 className="text-xl font-semibold mb-2">Sinopsis</h3>
                        <p className="text-gray-300 leading-relaxed">{anime.description}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-gray-800 p-4 rounded-lg">
                            <p className="text-gray-400 text-sm">Episodios</p>
                            <p className="text-2xl font-bold">{anime.episodes || 'N/A'}</p>
                        </div>
                        <div className="bg-gray-800 p-4 rounded-lg">
                            <p className="text-gray-400 text-sm">Duración</p>
                            <p className="text-2xl font-bold">{anime.duration ? `${anime.duration} min` : 'N/A'}</p>
                        </div>
                        <div className="bg-gray-800 p-4 rounded-lg">
                            <p className="text-gray-400 text-sm">Tu Progreso</p>
                            <p className="text-2xl font-bold text-cyan-400">{anime.progress_percentage}%</p>
                        </div>
                        <div className="bg-gray-800 p-4 rounded-lg">
                            <p className="text-gray-400 text-sm">Tu Puntuación</p>
                            <p className="text-2xl font-bold text-yellow-400">
                                {anime.user_score ? `${anime.user_score} ★` : 'Sin puntuar'}
                            </p>
                        </div>
                    </div>

                    <p className="text-gray-500 text-sm">
                        {/* Temporadas y Episodios */}
                        {anime.seasons && anime.seasons.length > 0 && (
                            <div className="mt-8">
                                <h3 className="text-2xl font-bold mb-4">Temporadas y Episodios</h3>
                                {anime.seasons.map((season) => (
                                    <SeasonAccordion
                                        key={season.id}
                                        season={season}
                                        onEpisodeClick={handleEpisodeClick}
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
                    </p>
                </div>
            </div>
        </div>
    )
}

export default AnimeDetail;