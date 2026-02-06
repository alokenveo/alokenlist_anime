import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

function Dashboard() {
    const [animes, setAnimes] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchAnimes();
    }, [])

    async function fetchAnimes() {
        try {
            const { data, error } = await supabase
                .from("animes")
                .select("*")
                .order("date_added", { ascending: false });

            if (error) throw error;
            setAnimes(data || []);
        }
        catch (error) {
            console.error("Error fetching animes:", error);
        }
        finally {
            setLoading(false);
        }
    }

    function handleAnimeClick(animeId) {
        navigate(`/anime/${animeId}`);
    }

    if (loading) {
        return <div className="text-white text-center mt-20">Cargando...</div>
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-white">Mi Dashboard</h2>
            </div>

            {animes.length === 0 ? (
                <div className="text-center mt-20">
                    <p className="text-gray-400 text-lg">No tienes animes añadidos todavía</p>
                    <p className="text-gray-500 mt-2">¡Empieza añadiendo tu primer anime!</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {animes.map(anime => (
                        <div key={anime.id} className="bg-gray-800 rounded-lg overflow-hidden hover:ring-2 hover:ring-cyan-400 transition cursor-pointer" onClick={() => handleAnimeClick(anime.id)}>
                            <img
                                src={anime.cover_image || 'https://via.placeholder.com/230x345'}
                                alt={anime.title}
                                className="w-full h-72 object-cover"
                            />
                            <div className="p-4">
                                <h3 className="text-white font-semibold truncate mb-2">{anime.title}</h3>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-yellow-400">{'★'.repeat(Math.round(anime.user_score || 0))}</span>
                                    <span className="text-cyan-400 font-bold">{anime.progress_percentage}%</span>
                                </div>
                                <div className="mt-2 bg-gray-700 rounded-full h-2">
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

export default Dashboard;