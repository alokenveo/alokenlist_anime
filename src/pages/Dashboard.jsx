import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Dashboard() {
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    watching: 0,
    planToWatch: 0,
    planned: 0,
    favorites: 0
  })
  const [favorites, setFavorites] = useState([])
  const [plannedAnimes, setPlannedAnimes] = useState([])
  const [recentAnimes, setRecentAnimes] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchDashboardData()
  }, [])

  async function fetchDashboardData() {
    try {
      // Obtener todos los animes para estadísticas
      const { data: allAnimes, error: allError } = await supabase
        .from('animes')
        .select('user_status, favorite, planned')

      if (allError) throw allError

      // Calcular estadísticas
      const statsData = {
        total: allAnimes.length,
        completed: allAnimes.filter(a => a.user_status === 'COMPLETED').length,
        watching: allAnimes.filter(a => a.user_status === 'WATCHING').length,
        planToWatch: allAnimes.filter(a => a.user_status === 'PLAN_TO_WATCH').length,
        planned: allAnimes.filter(a => a.planned === true).length,
        favorites: allAnimes.filter(a => a.favorite === true).length
      }
      setStats(statsData)

      // Obtener favoritos (máximo 5)
      const { data: favData, error: favError } = await supabase
        .from('animes')
        .select('*')
        .eq('favorite', true)
        .order('date_updated', { ascending: false })
        .limit(5)

      if (favError) throw favError
      setFavorites(favData || [])

      // Obtener planificados (máximo 5)
      const { data: plannedData, error: plannedError } = await supabase
        .from('animes')
        .select('*')
        .eq('planned', true)
        .order('date_added', { ascending: false })
        .limit(5)

      if (plannedError) throw plannedError
      setPlannedAnimes(plannedData || [])

      // Obtener añadidos recientemente (últimos 5)
      const { data: recentData, error: recentError } = await supabase
        .from('animes')
        .select('*')
        .order('date_added', { ascending: false })
        .limit(5)

      if (recentError) throw recentError
      setRecentAnimes(recentData || [])

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  function handleAnimeClick(animeId) {
    navigate(`/anime/${animeId}`)
  }

  if (loading) {
    return <div className="text-white text-center mt-20">Cargando...</div>
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-gray-400">Bienvenido a tu panel de control de anime</p>
      </div>

      {/* Estadísticas */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">Estadísticas</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-gray-800 p-6 rounded-lg">
            <p className="text-gray-400 text-sm mb-1">Registrados</p>
            <p className="text-3xl font-bold text-cyan-400">{stats.total}</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <p className="text-gray-400 text-sm mb-1">Completados</p>
            <p className="text-3xl font-bold text-green-400">{stats.completed}</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <p className="text-gray-400 text-sm mb-1">En Proceso</p>
            <p className="text-3xl font-bold text-yellow-400">{stats.watching}</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <p className="text-gray-400 text-sm mb-1">Por Ver</p>
            <p className="text-3xl font-bold text-purple-400">{stats.planToWatch}</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <p className="text-gray-400 text-sm mb-1">Planificados</p>
            <p className="text-3xl font-bold text-purple-300">📌 {stats.planned}</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <p className="text-gray-400 text-sm mb-1">Favoritos</p>
            <p className="text-3xl font-bold text-red-400">❤️ {stats.favorites}</p>
          </div>
        </div>
      </div>

      {/* Favoritos */}
      {favorites.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">❤️ Favoritos</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {favorites.map(anime => (
              <div
                key={anime.id}
                onClick={() => handleAnimeClick(anime.id)}
                className="bg-gray-800 rounded-lg overflow-hidden hover:ring-2 hover:ring-red-500 transition cursor-pointer"
              >
                <img
                  src={anime.cover_image || 'https://via.placeholder.com/230x345'}
                  alt={anime.title}
                  className="w-full h-64 object-cover"
                />
                <div className="p-3">
                  <h3 className="text-white font-semibold truncate text-sm">{anime.title}</h3>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-cyan-400 text-xs font-bold">{anime.progress_percentage}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Planificados para ver */}
      {plannedAnimes.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">📌 Planificados para Ver</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {plannedAnimes.map(anime => (
              <div
                key={anime.id}
                onClick={() => handleAnimeClick(anime.id)}
                className="bg-gray-800 rounded-lg overflow-hidden hover:ring-2 hover:ring-purple-500 transition cursor-pointer relative"
              >
                <div className="absolute top-2 right-2 z-10">
                  <span className="text-2xl drop-shadow-lg">📌</span>
                </div>
                <img
                  src={anime.cover_image || 'https://via.placeholder.com/230x345'}
                  alt={anime.title}
                  className="w-full h-64 object-cover"
                />
                <div className="p-3">
                  <h3 className="text-white font-semibold truncate text-sm">{anime.title}</h3>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-400">
                      {anime.episodes} eps
                    </span>
                    <span className="text-cyan-400 text-xs font-bold">{anime.progress_percentage}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Añadidos recientemente */}
      {recentAnimes.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">🆕 Añadidos Recientemente</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {recentAnimes.map(anime => (
              <div
                key={anime.id}
                onClick={() => handleAnimeClick(anime.id)}
                className="bg-gray-800 rounded-lg overflow-hidden hover:ring-2 hover:ring-cyan-400 transition cursor-pointer relative"
              >
                {/* Badges de preferencia */}
                {(anime.favorite || anime.planned || anime.disliked) && (
                  <div className="absolute top-2 right-2 flex gap-1 z-10">
                    {anime.favorite && <span className="text-xl drop-shadow-lg">❤️</span>}
                    {anime.planned && <span className="text-xl drop-shadow-lg">📌</span>}
                    {anime.disliked && <span className="text-xl drop-shadow-lg">💔</span>}
                  </div>
                )}

                <img
                  src={anime.cover_image || 'https://via.placeholder.com/230x345'}
                  alt={anime.title}
                  className="w-full h-64 object-cover"
                />
                <div className="p-3">
                  <h3 className="text-white font-semibold truncate text-sm">{anime.title}</h3>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-400">
                      {new Date(anime.date_added).toLocaleDateString('es-ES')}
                    </span>
                    <span className="text-cyan-400 text-xs font-bold">{anime.progress_percentage}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}