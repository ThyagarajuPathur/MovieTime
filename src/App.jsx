import './App.css'
import Search from "./Components/Search.jsx";
import {useEffect, useState} from "react";
import Spinner from "./Components/Spinner.jsx";
import MovieCard from "./Components/MovieCard.jsx";
import {useDebounce} from "react-use";
import {getTrendingMovies, updateSearchCount} from "./appwrite.js";


const API_BASE_URL = "https://api.themoviedb.org/3/";
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
    method: "GET",
    headers: {
        Accept: "application/json",
        Authorization: `Bearer ${API_KEY}`,
    }
}

function App() {
    const[searchTerm, setSearchTerm] = useState("");
    const[errorMessage, setErrorMessage] = useState("");
    const[movieList, setMovieList] = useState([]);
    const[isLoading, setIsLoading] = useState(false);
    const[debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
    const[trendingMovies, setTrendingMovies] = useState([]);

    useDebounce(()=>setDebouncedSearchTerm(searchTerm),500,[searchTerm]);

    const fetchMovies = async (query='') => {
        setIsLoading(true);
        setErrorMessage('')
        try{
            const endpoint = query ?
                `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}` :
                `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;
            const response = await fetch(endpoint, API_OPTIONS);

            if(!response.ok){
                throw new Error("Could not fetch movies from API");
            }

            const data = await response.json();

            if(data.Response === 'False'){
                setErrorMessage("Failed to fetch movies");
                setMovieList([])
                return;
            }
            setMovieList(data.results || [])

            if(query && data.results.length > 0){
                await updateSearchCount(query,data.results[0]);
            }

        }
        catch(e){
            console.log(`error in fetchMovies ${e}`);
            setErrorMessage('Error fetching movies. Please try again later.');
        }
        finally {
            setIsLoading(false);
        }

    }

    const fetchTrendingMovies = async () => {
        try{
            const movies = await getTrendingMovies();
            setTrendingMovies(movies);
        }
        catch (e){
            console.log(e)
        }
    }

    useEffect(()=>{
        fetchMovies(debouncedSearchTerm);
    },[debouncedSearchTerm]);

    useEffect(()=>{
        fetchTrendingMovies();
    },[]);


    return (
    <main>
        <div className="pattern"/>
        <div className="wrapper">
            <header>
                <img src="/hero.png" alt="Hero Banner" />
                <h1>Find <span className="text-gradient">Movies</span> You'll Enjoy without the hassle</h1>
            <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
            </header>

            {trendingMovies.length > 0 && (
                <section className="trending">
                    <h2>Trending Movies</h2>
                    <ul>
                        {trendingMovies.map((movie,index)=>(
                            <li key={movie.$id}>
                                <p>{index+1}</p>
                                <img src={movie.poster_url} alt={movie.title}/>
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            <section className="all-movies">
                <h2 className="mt-[40px]">All Movies</h2>
                {isLoading ? (
                    <Spinner/>
                ) : errorMessage ? (
                    <p className="test-red-500">{errorMessage}</p>
                ) : (
                    <ul>
                        {movieList.map((movie) => (
                            <MovieCard key={movie.id} movie={movie}/>
                        ))}
                    </ul>
                )}
            </section>
        </div>
    </main>
    )
}

export default App
