import axios from "axios";

const tmdbAxios = axios.create({
  baseURL: process.env.TMBD_API_BASE,
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}`,
  },
});

export async function searchMovies(query: string) {
  const response = await tmdbAxios.get(`/search/movie?query=${query}&page=1`);
  return response.data.results;
}

export async function moveDetails(id: string) {
  const response = await tmdbAxios.get(`/movie/${id}`);
  return response.data;
}

export async function similarMovies(id: string) {
  const response = await tmdbAxios.get(`movie/${id}/similar`);
  return response.data.results;
}
