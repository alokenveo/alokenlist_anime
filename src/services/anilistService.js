const ANILIST_API_URL = 'https://graphql.anilist.co';

export async function searchAnime(query) {
  const graphqlQuery = `
    query ($search: String) {
      Page(page: 1, perPage: 5) {
        media(search: $search, type: ANIME, sort: POPULARITY_DESC) {
          id
          idMal
          title {
            romaji
            english
            native
          }
          description
          coverImage {
            large
            extraLarge
          }
          bannerImage
          averageScore
          genres
          format
          status
          episodes
          season
          seasonYear
          duration
          relations {
            edges {
              relationType
              node {
                id
                type
                format
                status
                episodes
                season
                seasonYear
                title {
                  romaji
                  english
                }
              }
            }
          }
        }
      }
    }
  `;

  const variables = {
    search: query
  };

  try {
    const response = await fetch(ANILIST_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query: graphqlQuery,
        variables: variables
      })
    });

    const data = await response.json();
    return data.data.Page.media;
  } catch (error) {
    console.error('Error fetching from AniList:', error);
    throw error;
  }
}

// Obtener todas las temporadas de un anime
export async function getAnimeWithSeasons(id) {
  const graphqlQuery = `
    query ($id: Int) {
      Media(id: $id, type: ANIME) {
        id
        idMal
        title {
          romaji
          english
          native
        }
        description
        coverImage {
          large
          extraLarge
        }
        bannerImage
        averageScore
        genres
        format
        status
        episodes
        season
        seasonYear
        duration
        relations {
          edges {
            relationType
            node {
              id
              type
              format
              status
              episodes
              season
              seasonYear
              title {
                romaji
                english
              }
            }
          }
        }
      }
    }
  `;

  const variables = { id };

  try {
    const response = await fetch(ANILIST_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query: graphqlQuery,
        variables: variables
      })
    });

    const data = await response.json();
    const anime = data.data.Media;
    
    // Extraer secuelas/precuelas que sean TV o películas relacionadas
    const seasons = [];
    
    // Añadir la temporada actual
    seasons.push({
      anilist_id: anime.id,
      season_number: 1,
      title: anime.title.romaji || anime.title.english,
      episodes: anime.episodes,
      season: anime.season,
      year: anime.seasonYear
    });

    // Buscar SEQUEL (temporadas posteriores)
    if (anime.relations?.edges) {
      const sequels = anime.relations.edges
        .filter(edge => 
          edge.relationType === 'SEQUEL' && 
          edge.node.type === 'ANIME' &&
          edge.node.format === 'TV'
        )
        .map(edge => edge.node);

      // Recursivamente obtener las siguientes temporadas
      for (const sequel of sequels) {
        const nextSeasonData = await getAnimeWithSeasons(sequel.id);
        seasons.push(...nextSeasonData.seasons.map(s => ({
          ...s,
          season_number: s.season_number + seasons.length
        })));
      }
    }

    return {
      ...anime,
      seasons: seasons
    };
  } catch (error) {
    console.error('Error fetching anime with seasons:', error);
    throw error;
  }
}

export async function getAnimeById(id) {
  return getAnimeWithSeasons(id);
}