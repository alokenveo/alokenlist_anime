import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function SeasonAccordion({ season, onEpisodeClick, onSeasonUpdate }) {
  const [isOpen, setIsOpen] = useState(false)
  const [marking, setMarking] = useState(false)

  const progress = season.total_episodes > 0
    ? Math.round((season.episodes_watched / season.total_episodes) * 100)
    : 0

  const allWatched = progress === 100

  async function markAllAsWatched() {
    setMarking(true)
    try {
      // Actualizar todos los episodios de esta temporada
      const { error } = await supabase
        .from('episodes')
        .update({
          watched: true,
          watched_date: new Date().toISOString()
        })
        .eq('season_id', season.id)

      if (error) throw error

      // Refrescar la vista
      if (onSeasonUpdate) onSeasonUpdate()
    } catch (error) {
      console.error('Error marking all episodes as watched:', error)
      alert('Error al marcar los episodios')
    } finally {
      setMarking(false)
    }
  }

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden mb-4">
      {/* Header de la temporada */}
      <div className="w-full px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Lado izquierdo: botón expandir + info */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 sm:gap-4 flex-1 hover:opacity-80 transition"
          >
            <span className={`text-xl sm:text-2xl transition-transform ${isOpen ? 'rotate-90' : ''}`}>
              ›
            </span>
            <div className="text-left">
              <h3 className="text-base sm:text-xl font-bold text-white truncate">{season.title}</h3>
              <p className="text-xs sm:text-sm text-gray-400">
                {season.episodes_watched}/{season.total_episodes} episodios
              </p>
            </div>
          </button>

          {/* Lado derecho: progreso + barra + botón */}
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="text-right">
              <p className="text-cyan-400 font-bold text-sm sm:text-base">{progress}%</p>
            </div>
            <div className="w-20 sm:w-32 bg-gray-700 rounded-full h-2">
              <div
                className="bg-cyan-500 h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Botón marcar todos */}
            {!allWatched && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  markAllAsWatched()
                }}
                disabled={marking}
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg transition text-xs sm:text-sm font-medium whitespace-nowrap"
              >
                {marking ? '...' : '✓ Marcar todas'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Lista de episodios */}
      {isOpen && (
        <div className="px-4 sm:px-6 py-4 bg-gray-750 border-t border-gray-700">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
            {season.episodes?.map((episode) => (
              <button
                key={episode.id}
                onClick={() => onEpisodeClick(episode)}
                className={`px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-left transition text-sm sm:text-base ${episode.watched
                  ? 'bg-cyan-600 hover:bg-cyan-700 text-white'
                  : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                  }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold truncate">
                    Ep. {episode.episode_number}
                  </span>
                  {episode.watched && <span className="text-xs sm:text-sm ml-1">✓</span>}
                </div>
                {episode.user_score && (
                  <div className="text-xs text-yellow-300 mt-1">
                    {'★'.repeat(episode.user_score)}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}