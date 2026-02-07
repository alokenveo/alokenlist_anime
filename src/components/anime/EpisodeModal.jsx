import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function EpisodeModal({ episode, onClose, onUpdate }) {
  const [watched, setWatched] = useState(episode.watched)
  const [score, setScore] = useState(episode.user_score || 0)
  const [notes, setNotes] = useState(episode.notes || '')
  const [saving, setSaving] = useState(false)

  async function handleUpdate() {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('episodes')
        .update({
          watched: watched,
          user_score: score > 0 ? score : null,
          notes: notes.trim() || null,
          watched_date: watched ? new Date().toISOString() : null
        })
        .eq('id', episode.id)

      if (error) throw error

      onUpdate()
      onClose()
    } catch (error) {
      console.error('Error updating episode:', error)
      alert('Error al actualizar el episodio')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-gray-800 rounded-lg p-4 sm:p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-2xl font-bold text-white">
              Episodio {episode.episode_number}
            </h3>
            {episode.title && episode.title !== `Episodio ${episode.episode_number}` && (
              <p className="text-gray-400 mt-1">{episode.title}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Visto/No visto */}
        <div className="mb-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={watched}
              onChange={(e) => setWatched(e.target.checked)}
              className="w-6 h-6 rounded border-gray-600 text-cyan-500 focus:ring-cyan-500"
            />
            <span className="text-lg text-white">
              {watched ? '✓ Visto' : 'No visto'}
            </span>
          </label>
        </div>

        {/* Puntuación */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-400 mb-2">
            Puntuación
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setScore(star)}
                className="text-3xl transition-colors"
              >
                <span className={star <= score ? 'text-yellow-400' : 'text-gray-600'}>
                  ★
                </span>
              </button>
            ))}
            {score > 0 && (
              <button
                onClick={() => setScore(0)}
                className="ml-2 text-sm text-gray-400 hover:text-white"
              >
                Limpiar
              </button>
            )}
          </div>
        </div>

        {/* Notas */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-400 mb-2">
            Notas / Comentarios
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Escribe tus comentarios sobre este episodio..."
            className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 resize-none"
            rows="4"
          />
        </div>

        {/* Botones */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
          >
            Cancelar
          </button>
          <button
            onClick={handleUpdate}
            disabled={saving}
            className="px-6 py-2 bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-600 text-white rounded-lg transition"
          >
            {saving ? 'Guardando...' : 'Actualizar'}
          </button>
        </div>
      </div>
    </div>
  )
}