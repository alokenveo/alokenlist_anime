export default function SobreMi() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold text-white mb-6">Sobre Mí</h1>
      
      <div className="bg-gray-800 rounded-lg p-8 space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-cyan-400 mb-3">Alfredo Mituy Okenve (Fredy)</h2>
          <p className="text-gray-300 leading-relaxed">
            Ingeniero Informático apasionado por el anime y el desarrollo de software.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-white mb-2">¿Por qué AlokenList Anime?</h3>
          <p className="text-gray-300 leading-relaxed">
            Creé esta aplicación porque ninguna plataforma existente me permitía gestionar 
            mi lista de animes de la manera que yo quería. AlokenList Anime es mi solución personal 
            para llevar un seguimiento detallado de cada anime, temporada y episodio que veo.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-white mb-2">Tecnologías utilizadas</h3>
          <div className="flex flex-wrap gap-2">
            {['React', 'Supabase', 'Vercel', 'Tailwind CSS', 'AniList API'].map(tech => (
              <span key={tech} className="px-3 py-1 bg-cyan-600 rounded-full text-sm">
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}