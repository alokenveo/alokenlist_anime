import { useState } from "react";

function Sidebar({ isOpen }) {
    const [animes, setAnimes] = useState([]);

    if (!isOpen) return null;

    return (
        <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-gray-800 border-r border-gray-700 overflow-y-auto">
            <div className="p-4">
                {/* Filtros rápidos */}
                <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase mb-3">Filtros Rápidos</h3>
                    <div className="space-y-2">
                        <button className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded">
                            📺 Todos
                        </button>
                        <button className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded">
                            ⏸️ No vistos (0%)
                        </button>
                        <button className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded">
                            ▶️ En progreso
                        </button>
                        <button className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded">
                            ✅ Completados (100%)
                        </button>
                    </div>
                </div>

                {/* Lista de animes */}
                <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase mb-3">Mis Animes</h3>
                    <div className="space-y-2">
                        {animes.length === 0 ? (
                            <p className="text-sm text-gray-500 italic">No hay animes añadidos</p>
                        ) : (
                            animes.map(anime => (
                                <div key={anime.id} className="p-2 hover:bg-gray-700 rounded cursor-pointer">
                                    <p className="text-sm text-white truncate">{anime.title}</p>
                                    <p className="text-xs text-gray-400">{anime.progress_percentage}%</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Exportación */}
                <div>
                    <h3 className="text-sm font-semibold text-gray-400 uppercase mb-3">Exportación</h3>
                    <div className="space-y-2">
                        <button className="w-full px-3 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded transition">
                            📄 Exportar PDF
                        </button>
                        <button className="w-full px-3 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded transition">
                            📊 Exportar CSV
                        </button>
                    </div>
                </div>
            </div>
        </aside>
    )
}

export default Sidebar;