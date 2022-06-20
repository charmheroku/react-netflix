const API_KEY = "10923b261ba94d897ac6b81148314a3f";
const BASE_PATH = "https://api.themoviedb.org/3";

interface IMovie {
  id: number;
  backdrop_path: string;
  title: string;
  overview: string;
}

export interface IGetMovieResult {
  results: IMovie[];
}

interface IGenres {
  name: string;
}

export interface IGetMovieDetail {
  adult: boolean;
  genres: IGenres[];
  runtime: number;
  tagline: string;
  overview: string;
  status: string;
  vote_average: string;
}

// Movie

export function getNowPlayingMovies() {
  return fetch(`${BASE_PATH}/movie/now_playing?api_key=${API_KEY}`).then(
    (response) => response.json()
  );
}

export function getPopularMovies() {
  return fetch(`${BASE_PATH}/movie/popular?api_key=${API_KEY}`).then(
    (response) => response.json()
  );
}
export function getTopRatedMovies() {
  return fetch(`${BASE_PATH}/movie/top_rated?api_key=${API_KEY}`).then(
    (response) => response.json()
  );
}
export function getUpcomingMovies() {
  return fetch(`${BASE_PATH}/movie/upcoming?api_key=${API_KEY}`).then(
    (response) => response.json()
  );
}

export function getMovieDetail(movieId?: string) {
  return fetch(`${BASE_PATH}/movie/${movieId}?api_key=${API_KEY}`).then(
    (response) => response.json()
  );
}

interface ITv {
  id: number;
  backdrop_path: string;
  name: string;
  overview: string;
}

export interface IGetTvResult {
  results: ITv[];
}

interface IGenres {
  name: string;
}

export interface IGetTvDetail {
  genres: IGenres[];
  number_of_episodes: boolean;
  number_of_seasons: number;
  tagline: string;
  overview: string;
  status: string;
  vote_average: string;
}

// TV

export function getAiringTodayTvs() {
  return fetch(`${BASE_PATH}/tv/airing_today?api_key=${API_KEY}`).then(
    (response) => response.json()
  );
}

export function getOnTheAirTvs() {
  return fetch(`${BASE_PATH}/tv/on_the_air?api_key=${API_KEY}`).then(
    (response) => response.json()
  );
}
export function getPopularTvs() {
  return fetch(`${BASE_PATH}/tv/popular?api_key=${API_KEY}`).then((response) =>
    response.json()
  );
}
export function getTopRatedTvs() {
  return fetch(`${BASE_PATH}/tv/top_rated?api_key=${API_KEY}`).then(
    (response) => response.json()
  );
}

export function getTvDetail(tvId?: string) {
  return fetch(`${BASE_PATH}/tv/${tvId}?api_key=${API_KEY}`).then((response) =>
    response.json()
  );
}

// Search

interface ISearchResult {
  id: number;
  backdrop_path: string;
  poster_path: string;
  name?: string;
  title?: string;
  overview: string;
}

export interface IGetMultiSearchResult {
  results: ISearchResult[];
}

export function getMultiSearch(query?: string) {
  return fetch(
    `${BASE_PATH}/search/multi?api_key=${API_KEY}&query=${query}&page=1`
  ).then((response) => response.json());
}
