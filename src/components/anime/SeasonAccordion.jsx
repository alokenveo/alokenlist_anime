import { useState } from 'react'

export default function SeasonAccordion({ season, onEpisodeClick }) {
  const [isOpen, setIsOpen] = useState(false)

  const progress = season.total_episodes > 0 
    ? Math.round((season.episodes_watched / season.total_episodes) * 100)
    : 0

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden mb-4">
      {/* Header de la temporada */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-700 transition"
      >
        <div className="flex items-center gap-4">
          <span className={`text-2xl transition-transform ${isOpen ? 'rotate-90' : ''}`}>
            ›
          </span>
          <div className="text-left">
            <h3 className="text-xl font-bold text-white">{season.title}</h3>
            <p className="text-sm text-gray-400">
              {season.episodes_watched}/{season.total_episodes} episodios
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-cyan-400 font-bold">{progress}%</p>
          </div>
          <div className="w-32 bg-gray-700 rounded-full h-2">
            <div 
              className="bg-cyan-500 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </button>

      {/* Lista de episodios */}
      {isOpen && (
        <div className="px-6 py-4 bg-gray-750">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {season.episodes?.map((episode) => (
              <button
                key={episode.id}
                onClick={() => onEpisodeClick(episode)}
                className={`px-4 py-3 rounded-lg text-left transition ${
                  episode.watched
                    ? 'bg-cyan-600 hover:bg-cyan-700 text-white'
                    : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold">
                    Ep. {episode.episode_number}
                  </span>
                  {episode.watched && <span className="text-sm">✓</span>}
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