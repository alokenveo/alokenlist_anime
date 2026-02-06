import { supabase } from '../lib/supabase';
import { getAnimeWithSeasons } from './anilistService';

// Función para traducir texto al español
async function translateToSpanish(text) {
  if (!text) return '';
  
  try {
    const response = await fetch('https://libretranslate.de/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: stripHtml(text),
        source: 'en',
        target: 'es',
        format: 'text'
      })
    });

    const data = await response.json();
    return data.translatedText || stripHtml(text);
  } catch (error) {
    console.error('Error translating:', error);
    return stripHtml(text);
  }
}

// Añadir un anime a la base de datos con todas sus temporadas
export async function addAnimeToDatabase(animeData) {
  try {
    // Obtener el anime completo con todas sus temporadas
    const fullAnimeData = await getAnimeWithSeasons(animeData.id);
    
    // Verificar si ya existe
    const { data: existing } = await supabase
      .from('animes')
      .select('id')
      .eq('anilist_id', fullAnimeData.id)
      .single();

    if (existing) {
      throw new Error('Este anime ya está en tu lista');
    }

    // Traducir descripción
    const descriptionSpanish = await translateToSpanish(fullAnimeData.description);

    // Determinar el estado del anime
    let animeStatus = 'RELEASING';
    if (fullAnimeData.status === 'FINISHED') {
      // Verificar si hay secuelas pendientes
      const hasOngoingSequel = fullAnimeData.relations?.edges?.some(edge => 
        edge.relationType === 'SEQUEL' && 
        edge.node.status !== 'FINISHED'
      );
      animeStatus = hasOngoingSequel ? 'RELEASING' : 'FINISHED';
    }

    // Calcular total de episodios de todas las temporadas
    const totalEpisodes = fullAnimeData.seasons.reduce((sum, s) => sum + (s.episodes || 0), 0);

    // Insertar el anime
    const { data: anime, error: animeError } = await supabase
      .from('animes')
      .insert([{
        anilist_id: fullAnimeData.id,
        title: fullAnimeData.title.romaji || fullAnimeData.title.english,
        title_english: fullAnimeData.title.english,
        title_romaji: fullAnimeData.title.romaji,
        description: descriptionSpanish,
        cover_image: fullAnimeData.coverImage?.extraLarge || fullAnimeData.coverImage?.large,
        banner_image: fullAnimeData.bannerImage,
        genres: fullAnimeData.genres,
        format: fullAnimeData.format,
        status: animeStatus,
        season: fullAnimeData.season,
        season_year: fullAnimeData.seasonYear,
        episodes: totalEpisodes,
        duration: fullAnimeData.duration,
        user_status: 'PLAN_TO_WATCH',
        user_score: null,
        progress_percentage: 0
      }])
      .select()
      .single();

    if (animeError) throw animeError;

    // Crear todas las temporadas
    for (const seasonData of fullAnimeData.seasons) {
      if (!seasonData.episodes || seasonData.episodes === 0) continue;

      const { data: season, error: seasonError } = await supabase
        .from('seasons')
        .insert([{
          anime_id: anime.id,
          season_number: seasonData.season_number,
          title: `Temporada ${seasonData.season_number}`,
          total_episodes: seasonData.episodes,
          episodes_watched: 0
        }])
        .select()
        .single();

      if (seasonError) throw seasonError;

      // Crear episodios para esta temporada
      const episodes = [];
      for (let i = 1; i <= seasonData.episodes; i++) {
        episodes.push({
          season_id: season.id,
          episode_number: i,
          title: `Episodio ${i}`,
          watched: false
        });
      }

      const { error: episodesError } = await supabase
        .from('episodes')
        .insert(episodes);

      if (episodesError) throw episodesError;
    }

    return anime;
  } catch (error) {
    console.error('Error adding anime to database:', error);
    throw error;
  }
}

// Obtener todos los animes del usuario
export async function getAllAnimes() {
  try {
    const { data, error } = await supabase
      .from('animes')
      .select('*')
      .order('date_added', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching animes:', error);
    throw error;
  }
}

// Obtener anime con sus temporadas y episodios
export async function getAnimeWithDetails(animeId) {
  try {
    // Obtener anime
    const { data: anime, error: animeError } = await supabase
      .from('animes')
      .select('*')
      .eq('id', animeId)
      .single();

    if (animeError) throw animeError;

    // Obtener temporadas con episodios
    const { data: seasons, error: seasonsError } = await supabase
      .from('seasons')
      .select(`
        *,
        episodes (*)
      `)
      .eq('anime_id', animeId)
      .order('season_number', { ascending: true });

    if (seasonsError) throw seasonsError;

    return {
      ...anime,
      seasons: seasons || []
    };
  } catch (error) {
    console.error('Error fetching anime details:', error);
    throw error;
  }
}

// Función auxiliar para limpiar HTML
function stripHtml(html) {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '');
}