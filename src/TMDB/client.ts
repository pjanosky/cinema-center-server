import axios from "axios";
import { CastMember, Movie, MovieDetails } from "./types";

const tmdbAxios = axios.create({
  baseURL: process.env.TMBD_API_BASE,
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}`,
  },
});

export async function searchMovies(query: string): Promise<Movie[]> {
  const response = await tmdbAxios.get(`/search/movie?query=${query}&page=1`);
  return response.data.results;
}

export async function moveDetails(id: string): Promise<MovieDetails> {
  const response = await tmdbAxios.get(`/movie/${id}`);
  return response.data;
}

export async function similarMovies(id: string): Promise<Movie[]> {
  const response = await tmdbAxios.get(`/movie/${id}/similar`);
  return response.data.results;
}

export async function movieCast(id: string): Promise<CastMember[]> {
  const response = await tmdbAxios.get(`/movie/${id}/credits`);
  return response.data.cast;
}
