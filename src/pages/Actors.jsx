/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import "./Home.css";
import Search from "../components/Search.jsx";
import Loading from "../components/Loading.jsx";
import ActorCard from "../components/ActorCard.jsx";
import { useDebounce } from "react-use";
import { Analytics } from "@vercel/analytics/react";
import ActorDetail from "../components/ActorDetail.jsx";
import Footer from "../components/Footer.jsx";
import { Link } from "react-router-dom";

const API_BASE_URL = "https://api.themoviedb.org/3";
const VITE_API_READ_ACCESS_TOKEN = import.meta.env.VITE_API_READ_ACCESS_TOKEN;

const API_OPTIONS = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${VITE_API_READ_ACCESS_TOKEN}`,
  },
};

const Actors = () => {
  const [searchTerm, setsearchTerm] = useState("");
  const [errorMessage, seterrorMessage] = useState("");
  const [actorList, setactorList] = useState([]);
  const [popularActors, setpopularActors] = useState([]);
  const [isLoading, setisLoading] = useState(false);
  const [debouncedSearchTerm, setdebouncedSearchTerm] = useState("");
  const [selectedActor, setSelectedActor] = useState(null);

  useDebounce(() => setdebouncedSearchTerm(searchTerm), 500, [searchTerm]);

  const fetchActors = async (query = "") => {
    setisLoading(true);
    setactorList([]);
    try {
      const endpoint = query
        ? `${API_BASE_URL}/search/person?query=${encodeURIComponent(query)}`
        : `${API_BASE_URL}/person/popular`;
      const response = await fetch(endpoint, API_OPTIONS);

      if (!response.ok) {
        throw new Error("Failed to fetch actors.");
      }

      const data = await response.json();

      if (!data.results || data.results.length === 0) {
        seterrorMessage(data.Error || "Failed to fetch actors.");
        setactorList([]);
        return;
      }

      const filteredAndSortedActors = data.results
        .filter(actor => actor.popularity >= 5)
        // .sort((a, b) => a.name.localeCompare(b.name));
      
      setactorList(filteredAndSortedActors || []);
    } catch (error) {
      console.error(error);
      seterrorMessage("Error fetching actors. Please try again later.");
    } finally {
      setisLoading(false);
    }
  };

  const fetchActorDetails = async (actorId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/person/${actorId}`,
        API_OPTIONS
      );

      if (!response.ok) {
        throw new Error("Failed to fetch actor details.");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching actor details:", error);
      return null;
    }
  };

  const handleActorClick = async (actor) => {
    const details = await fetchActorDetails(actor.id);
    if (details) {
      setSelectedActor({...actor, ...details});
    }
  };

  const loadPopularActors = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/person/popular?page=1`,
        API_OPTIONS
      );
      
      if (!response.ok) {
        throw new Error("Failed to fetch popular actors");
      }
      
      const data = await response.json();
      setpopularActors(data.results.slice(0, 10) || []);
    } catch (error) {
      console.error(`Error fetching popular actors: ${error}`);
    }
  };

  useEffect(() => {
    fetchActors(debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  useEffect(() => {
    loadPopularActors();
  }, []);

  return (
    <main>
      <div className="pattern" />
      <div className="wrapper">
        <header className="mt-30">
          <h1>
            Kaun hai yeh log?
            <br />
            Kahan se aate hain?
          </h1>
          <Search
            searchTerm={searchTerm}
            setsearchTerm={setsearchTerm}
            PH="Search for Actors"
          />
          <Link to="/">
            <btn className="home-button">Back to Movies</btn>
          </Link>
        </header>

        <section className="all-movies">
          <h2 className="mt-[4px]">All Actors</h2>

          {isLoading ? (
            <Loading />
          ) : errorMessage ? (
            <p className="text-red-500">{errorMessage}</p>
          ) : actorList.length === 0 ? (
            <p className="text-red-500">No actors found matching your criteria.</p>
          ) : (
            <ul>
              {actorList.map((actor) => (
                <ActorCard
                  key={actor.id}
                  actor={actor}
                  onClick={handleActorClick}
                />
              ))}
            </ul>
          )}
        </section>

        {selectedActor && (
          <ActorDetail
            actor={selectedActor}
            onClose={() => setSelectedActor(null)}
          />
        )}

        <Footer />
        <Analytics />
      </div>
    </main>
  );
};

export default Actors;