export default function SobreMi() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold text-white mb-6">Sobre Mí</h1>

      <div className="bg-gray-800 rounded-lg p-6 sm:p-8 space-y-6">
        {/* Foto de perfil y nombre */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <img
            src="/perfil.png"
            alt="Alfredo Mituy Okenve"
            className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover border-4 border-cyan-400 shadow-lg"
          />
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-2xl sm:text-3xl font-bold text-cyan-400 mb-2">
              Alfredo Mituy Okenve
            </h2>
            <p className="text-lg text-gray-400 mb-3">Fredy</p>
            <p className="text-gray-300 leading-relaxed">
              Ingeniero Informático apasionado por el anime y el desarrollo de software.
            </p>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-6">
          <h3 className="text-xl font-semibold text-white mb-3">¿Por qué AlokenList Anime?</h3>
          <p className="text-gray-300 leading-relaxed">
            Creé esta aplicación porque ninguna plataforma existente me permitía gestionar
            mi lista de animes de la manera que yo quería. AlokenList Anime es mi solución personal
            para llevar un seguimiento detallado de cada anime, temporada y episodio que veo.
          </p>
        </div>

        <div className="border-t border-gray-700 pt-6">
          <h3 className="text-xl font-semibold text-white mb-3">Motivación</h3>
          <p className="text-gray-300 leading-relaxed">
            Como desarrollador y fan del anime, siempre quise una herramienta que combinara
            precisión técnica con una experiencia de usuario personalizada. AlokenList no es
            solo un tracker, es mi visión de cómo debería ser la gestión perfecta de contenido anime.
          </p>
        </div>

        <div className="border-t border-gray-700 pt-6">
          <h3 className="text-xl font-semibold text-white mb-3">Stack Tecnológico</h3>
          <div className="flex flex-wrap gap-2">
            {['React', 'Supabase', 'Vercel', 'Tailwind CSS', 'TMDB API'].map(tech => (
              <span key={tech} className="px-3 py-1 bg-cyan-600 rounded-full text-sm">
                {tech}
              </span>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-700 pt-6">
          <h3 className="text-xl font-semibold text-white mb-3">Contacto</h3>
          <div className="flex flex-wrap gap-4">
            <a
              href="https://github.com/alokenveo"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              GitHub
            </a>
            <a
              href="mailto:fredymituy@gmail.com"
              className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Email
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}