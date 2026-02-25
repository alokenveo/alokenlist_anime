import { supabase } from '../lib/supabase';
import { getAnimeWithSeasons } from './tmdbService';

// Función auxiliar para limpiar HTML
function stripHtml(html) {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '');
}

// Añadir un anime a la base de datos con todas sus temporadas
export async function addAnimeToDatabase(animeData) {
  try {
    // Obtener el anime completo con todas sus temporadas
    const fullAnimeData = await getAnimeWithSeasons(animeData.id);

    // Verificar si ya existe
    const { data: existing, error: checkError } = await supabase
      .from('animes')
      .select('id')
      .eq('tmdb_id', fullAnimeData.id)
      .maybeSingle(); // Cambiado de .single() a .maybeSingle()

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    if (existing) {
      throw new Error('Este anime ya está en tu lista');
    }

    // Determinar el estado del anime
    let animeStatus = 'RELEASING';
    if (fullAnimeData.status === 'FINISHED') {
      const hasOngoingSequel = fullAnimeData.relations?.edges?.some(edge =>
        edge.relationType === 'SEQUEL' &&
        edge.node.status !== 'FINISHED'
      );
      animeStatus = hasOngoingSequel ? 'RELEASING' : 'FINISHED';
    }

    // Calcular total de episodios de todas las temporadas
    const totalEpisodes = fullAnimeData.seasons.reduce((sum, s) => sum + (s.episodes || 0), 0);

    // Insertar el anime (sin traducción, en inglés)
    const { data: anime, error: animeError } = await supabase
      .from('animes')
      .insert([{
        tmdb_id: fullAnimeData.id,
        title: fullAnimeData.title.romaji || fullAnimeData.title.english,
        title_english: fullAnimeData.title.english,
        title_romaji: fullAnimeData.title.romaji,
        description: stripHtml(fullAnimeData.description), // Sin traducir
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

// Mapeo de sortBy a columna y dirección de Supabase
function buildOrderParams(sortBy) {
  switch (sortBy) {
    case 'alphabetical': return { column: 'title', ascending: true };
    case 'alphabetical-desc': return { column: 'title', ascending: false };
    case 'progress-desc': return { column: 'progress_percentage', ascending: false };
    case 'progress-asc': return { column: 'progress_percentage', ascending: true };
    case 'episodes-desc': return { column: 'episodes', ascending: false };
    case 'episodes-asc': return { column: 'episodes', ascending: true };
    case 'score-desc': return { column: 'user_score', ascending: false };
    case 'score-asc': return { column: 'user_score', ascending: true };
    case 'recent': return { column: 'date_added', ascending: false };
    case 'oldest': return { column: 'date_added', ascending: true };
    default: return { column: 'date_added', ascending: false };
  }
}

// Aplicar filtros comunes a una query de Supabase
function applyFilters(query, { searchQuery, filters }) {
  // Búsqueda por texto (OR entre los tres campos de título)
  if (searchQuery && searchQuery.trim()) {
    const q = `%${searchQuery.trim()}%`;
    query = query.or(
      `title.ilike.${q},title_english.ilike.${q},title_romaji.ilike.${q}`
    );
  }

  // Filtro por estado
  if (filters.status && filters.status.length > 0) {
    query = query.in('user_status', filters.status);
  }

  // Filtro por géneros (el anime debe contener AL MENOS uno de los géneros)
  if (filters.genres && filters.genres.length > 0) {
    query = query.overlaps('genres', filters.genres);
  }

  // Filtro por preferencia
  if (filters.preference === 'favorite') query = query.eq('favorite', true);
  if (filters.preference === 'planned') query = query.eq('planned', true);
  if (filters.preference === 'disliked') query = query.eq('disliked', true);

  return query;
}

// Obtener animes paginados con filtros y ordenación en el servidor
export async function getAnimesPaginated({ page = 1, pageSize = 24, searchQuery = '', filters = {}, sortBy = 'alphabetical' }) {
  try {
    const { column, ascending } = buildOrderParams(sortBy);
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from('animes')
      .select('*', { count: 'exact' })
      .order(column, { ascending, nullsFirst: false })
      .range(from, to);

    query = applyFilters(query, { searchQuery, filters });

    const { data, error, count } = await query;
    if (error) throw error;

    return { data, count };
  } catch (error) {
    console.error('Error fetching paginated animes:', error);
    throw error;
  }
}

// Obtener TODOS los animes filtrados (sin paginación, para exportar PDF)
export async function getAllAnimesFiltered({ searchQuery = '', filters = {}, sortBy = 'alphabetical' }) {
  try {
    const { column, ascending } = buildOrderParams(sortBy);

    let query = supabase
      .from('animes')
      .select('*')
      .order(column, { ascending, nullsFirst: false });

    query = applyFilters(query, { searchQuery, filters });

    const { data, error } = await query;
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching filtered animes:', error);
    throw error;
  }
}

// Obtener géneros únicos disponibles (trae solo la columna genres)
export async function getAvailableGenres() {
  try {
    const { data, error } = await supabase
      .from('animes')
      .select('genres');

    if (error) throw error;

    const genresSet = new Set();
    data.forEach(row => row.genres?.forEach(g => genresSet.add(g)));
    return Array.from(genresSet).sort();
  } catch (error) {
    console.error('Error fetching genres:', error);
    return [];
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