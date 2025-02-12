/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import "./Home.css";
import Search from "../components/Search.jsx";
import Loading from "../components/Loading.jsx";
import MovieCard from "../components/MovieCard.jsx";
import { useDebounce } from "react-use";
import { getTrendingMovies, updateSearchCount } from "../appwrite.js";
import { Analytics } from "@vercel/analytics/react";
import MovieDetail from "../components/MovieDetail.jsx"
import Footer from "../components/Footer.jsx";

const API_BASE_URL = "https://api.themoviedb.org/3";
const VITE_API_READ_ACCESS_TOKEN = import.meta.env.VITE_API_READ_ACCESS_TOKEN;

const API_OPTIONS = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${VITE_API_READ_ACCESS_TOKEN}`,
  },
};

const Home = () => {
  const [searchTerm, setsearchTerm] = useState("");
  const [errorMessage, seterrorMessage] = useState("");
  const [movieList, setmovieList] = useState([]);
  const [trendingList, settrendingList] = useState([]);
  const [isLoading, setisLoading] = useState(false);
  const [debouncedSearchTerm, setdebouncedSearchTerm] = useState("");
  const [selectedMovie, setSelectedMovie] = useState(null);

  useDebounce(() => setdebouncedSearchTerm(searchTerm), 500, [searchTerm]);

  const fetchMovies = async (query = "") => {
    setisLoading(true);
    setmovieList([]);
    try {
      const endpoint = query
        ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
        : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;
      const response = await fetch(endpoint, API_OPTIONS);

      if (!response.ok) {
        throw new Error("Failed to fetch movies.");
      }

      const data = await response.json();
      // console.log(data);

      if (!data.results || data.results.length === 0) {
        seterrorMessage(data.Error || "Failed to fetch movies.");
        setmovieList([]);
        return;
      }

      setmovieList(data.results || []);

      if (query && data.results.length > 0) {
        await updateSearchCount(query, data.results[0]);
      }
    } catch (error) {
      console.error(error);
      seterrorMessage("Error fetching movies. Please try again later.");
    } finally {
      setisLoading(false);
    }
  };

  const fetchMovieDetails = async (movieId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/movie/${movieId}`,
        API_OPTIONS
      );

      if (!response.ok) {
        throw new Error("Failed to fetch movie details.");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching movie details:", error);
      return null;
    }
  };

  const handleMovieClick = async (movie) => {
    const details = await fetchMovieDetails(movie.id);
    if (details) {
      setSelectedMovie(details);
    }
  };

  const loadTrendingMovies = async () => {
    try {
      const movies = await getTrendingMovies();

      settrendingList(movies);
    } catch (error) {
      console.error(`Error fetching trending movies: ${error}`);
    }
  };

  useEffect(() => {
    fetchMovies(debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  useEffect(() => {
    loadTrendingMovies();
  }, []);

  return (
    <main>
      <div className="pattern" />
      <div className="wrapper">
        <header className="mt-30">
          <h1>
            Parde ke upar kya hai?
            <br />
            Chalchitra.
          </h1>
          <Search searchTerm={searchTerm} setsearchTerm={setsearchTerm} PH = "Search for Movies"/>
        </header>

        {trendingList.length > 0 && (
          <section className="trending">
            <h2>Trending Movies</h2>

            <ul>
              {trendingList.map((movie, index) => (
                <li key={movie.$id}>
                  <p>{index + 1}</p>
                  <img src={movie.poster_url} alt={movie.title} />
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="all-movies">
          <h2 className="mt-[4px]">All Movies</h2>

          {isLoading ? (
            <Loading />
          ) : errorMessage ? (
            <p className="text-red-500">{errorMessage}</p>
          ) : (
            <ul>
              {movieList.map((movie) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  onClick={handleMovieClick}
                />
              ))}
            </ul>
          )}
        </section>

        {selectedMovie && (
          <MovieDetail
            movie={selectedMovie}
            onClose={() => setSelectedMovie(null)}
          />
        )}

        <Footer/>
        <Analytics />
      </div>
    </main>
  );
};

export default Home;
