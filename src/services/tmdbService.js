const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/original';

// Buscar animes (solo series con keyword de anime)
export async function searchAnime(query) {
  try {
    // Primero buscamos series de TV
    const response = await fetch(
      `${TMDB_BASE_URL}/search/tv?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=es-ES`
    );
    const data = await response.json();

    // Filtrar para obtener solo animes
    const animeResults = await Promise.all(
      data.results.slice(0, 10).map(async (show) => {
        // Obtener detalles para verificar si es anime
        const detailsResponse = await fetch(
          `${TMDB_BASE_URL}/tv/${show.id}?api_key=${TMDB_API_KEY}&language=es-ES`
        );
        const details = await detailsResponse.json();

        // Verificar si es anime por: géneros, keywords o país de origen
        const isAnime = 
          details.genres?.some(g => g.name === 'Animación') &&
          (details.origin_country?.includes('JP') || 
           details.original_language === 'ja');

        if (!isAnime) return null;

        return {
          id: show.id,
          title: {
            romaji: show.name,
            english: show.name,
            native: show.original_name
          },
          description: show.overview,
          coverImage: {
            large: show.poster_path ? `${TMDB_IMAGE_BASE}${show.poster_path}` : null,
            extraLarge: show.poster_path ? `${TMDB_IMAGE_BASE}${show.poster_path}` : null
          },
          bannerImage: show.backdrop_path ? `${TMDB_IMAGE_BASE}${show.backdrop_path}` : null,
          averageScore: show.vote_average ? show.vote_average * 10 : 0, // Convertir a escala 100
          genres: details.genres?.map(g => g.name) || [],
          format: 'TV',
          status: details.status === 'Ended' ? 'FINISHED' : 'RELEASING',
          episodes: details.number_of_episodes || 0,
          numberOfSeasons: details.number_of_seasons || 0,
          season: null,
          seasonYear: show.first_air_date ? new Date(show.first_air_date).getFullYear() : null,
          duration: details.episode_run_time?.[0] || null,
          seasons: details.seasons || []
        };
      })
    );

    // Filtrar nulls y devolver solo animes
    return animeResults.filter(anime => anime !== null).slice(0, 5);
  } catch (error) {
    console.error('Error fetching from TMDB:', error);
    throw error;
  }
}

// Obtener anime completo con todas sus temporadas
export async function getAnimeWithSeasons(id) {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/tv/${id}?api_key=${TMDB_API_KEY}&language=es-ES`
    );
    const data = await response.json();

    // Filtrar temporadas válidas (excluir specials si tienen season_number 0)
    const validSeasons = data.seasons
      ?.filter(s => s.season_number > 0 && s.episode_count > 0)
      .map(s => ({
        tmdb_id: s.id,
        season_number: s.season_number,
        title: s.name,
        episodes: s.episode_count,
        season: null,
        year: s.air_date ? new Date(s.air_date).getFullYear() : null,
        poster: s.poster_path ? `${TMDB_IMAGE_BASE}${s.poster_path}` : null
      })) || [];

    return {
      id: data.id,
      title: {
        romaji: data.name,
        english: data.name,
        native: data.original_name
      },
      description: data.overview,
      coverImage: {
        large: data.poster_path ? `${TMDB_IMAGE_BASE}${data.poster_path}` : null,
        extraLarge: data.poster_path ? `${TMDB_IMAGE_BASE}${data.poster_path}` : null
      },
      bannerImage: data.backdrop_path ? `${TMDB_IMAGE_BASE}${data.backdrop_path}` : null,
      averageScore: data.vote_average ? data.vote_average * 10 : 0,
      genres: data.genres?.map(g => g.name) || [],
      format: 'TV',
      status: data.status === 'Ended' ? 'FINISHED' : 'RELEASING',
      episodes: data.number_of_episodes || 0,
      season: null,
      seasonYear: data.first_air_date ? new Date(data.first_air_date).getFullYear() : null,
      duration: data.episode_run_time?.[0] || null,
      seasons: validSeasons
    };
  } catch (error) {
    console.error('Error fetching anime with seasons:', error);
    throw error;
  }
}

export async function getAnimeById(id) {
  return getAnimeWithSeasons(id);
}