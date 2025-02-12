/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import Search from "../components/Search";
import Footer from "../components/Footer";
import Loading from "../components/Loading";
import MovieCard from "../components/MovieCard";
import { useDebounce } from "react-use";
import MovieDetail from "../components/MovieDetail";
import { Cerebras } from "@cerebras/cerebras_cloud_sdk";

const API_BASE_URL = "https://api.themoviedb.org/3";
const VITE_API_READ_ACCESS_TOKEN = import.meta.env.VITE_API_READ_ACCESS_TOKEN;

const API_OPTIONS = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${VITE_API_READ_ACCESS_TOKEN}`,
  },
};

const AISearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [movieList, setMovieList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [aiEnhancedQuery, setAiEnhancedQuery] = useState("");

  useDebounce(() => setDebouncedSearchTerm(searchTerm), 500, [searchTerm]);

  const enhanceSearchWithAI = async (query) => {
    try {
      const client = new Cerebras({
        apiKey: import.meta.env.VITE_CEREBRAS_API_KEY,
      });

      const prompt = query;
      const instructions = "is given as an input. Your task is to analyze and break it down into a structured query specifically for retrieving movies from the TMDB API. Ensure the output is always movie-related: No matter what the input is, the result must be a query that leads to a list of movies. Extract key parameters from the query while keeping it general enough to return a good number of results. Avoid being too specific unless the query provides such details. Handle different types of queries appropriately: If the query is an actor/actress name, fetch their person_id first and then use it to get the movies they have acted in. If the query is a movie title, return details or search results for that movie. If the query is a genre, theme, or broad term like 'horror movies' or 'space adventures,' fetch movies fitting the genre. If the query is vague or unclear, assume a general movie search and return the most relevant results. If the query mentions TV Shows, show them. Construct only the continuation of the TMDB API URL (do not include 'https://api.themoviedb.org/3'). The output should be a valid URL path with parameters ready to be used in an API call. Do NOT BEGIN WITH 'discover'. Do NOT include the API key in the output. Examples: If the input is 'Jennifer Aniston,' the output should be 'search/person?query=Jennifer+Aniston&append_to_response=movie_credits.' If the input is 'Sci-fi adventure movies,' the output should be 'discover/movie?with_genres=878&sort_by=popularity.desc.' If the input is 'Titanic,' the output should be 'search/movie?query=Titanic.' If the input is 'Popular comedy films,' the output should be 'discover/movie?with_genres=35&sort_by=popularity.desc.' Remember, always return a SINGLE QUERY that ensures the result contains movies, no matter what the input is. Write ONE SINGLE QUERY, DONT START WITH '/' and return that as the answer. No explanations or other words just the URL path continuation.";
      // const instructions = "is an actor, write a query to print out the person_id for the person. ONLY QUERY, No explanation. Don't include API_KEY. Just Find the person_id"
      
      const finalPrompt = prompt + instructions;
      
      const stream = await client.chat.completions.create({
        model: "llama3.1-8b",
        stream: true,
        max_completion_tokens: 1024,
        temperature: 0.2,
        top_p: 1,
        messages: [
          {
            role: "system",
            content:
              "You are a TMDB movie search expert. Your task is to convert natural language queries into valid TMDB API URL paths that return only movies. No matter the input, always ensure the query results is a list of movies.",
          },
          {
            role: "user",
            content: finalPrompt,
          },
        ],
      });

      let enhancedQuery = "";
      for await (const chunk of stream) {
        enhancedQuery += chunk.choices[0].delta.content || "";
      }

      return enhancedQuery.trim();
    } catch (error) {
      console.error("AI Enhancement failed:", error);
      return query;
    }
  };

  const searchMovies = async (query) => {
    setIsLoading(true);
    setMovieList([]);
    setErrorMessage("");

    try {
      const enhancedQuery = await enhanceSearchWithAI(query);
      setAiEnhancedQuery(enhancedQuery);

      const endpoint = `${API_BASE_URL}/${enhancedQuery}`;
      const response = await fetch(endpoint, API_OPTIONS);

      if (!response.ok) {
        throw new Error("Failed to fetch movies");
      }

      const data = await response.json();
      // console.log(data);

      if (!data.results || data.results.length === 0) {
        setErrorMessage("No movies found matching your search.");
        return;
      }

      setMovieList(data.results);
    } catch (error) {
      console.error("Search error:", error);
      setErrorMessage("An error occurred while searching for movies.");
    } finally {
      setIsLoading(false);
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

  useEffect(() => {
    if (debouncedSearchTerm) {
      searchMovies(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm]);

  return (
    <div className="wrapper">
      <header className="mt-30">
        <h1>
          AI Powered Movie Search on
          <br />
          Chalchitra.
        </h1>
        <Search
          searchTerm={searchTerm}
          setsearchTerm={setSearchTerm}
          PH="Search for movies by characters, actors, story, etc"
        />
        {aiEnhancedQuery && (
          <p className="text-sm text-gray-600 mt-2">
            AI Enhanced Search: {aiEnhancedQuery}
          </p>
        )}
      </header>

      <section className="all-movies mt-8">
        {isLoading ? (
          <Loading />
        ) : errorMessage ? (
          <p className="text-red-500">{errorMessage}</p>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

      <Footer />
    </div>
  );
};

export default AISearch;
