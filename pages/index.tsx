import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Loader from "@/components/Loader";
import Image from "next/image";

interface Pokemon {
  name: string;
  url: string;
  image: string;
}

interface PokemonAPIResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Pokemon[];
}

// Debounce utility function
function debounce<T extends (...args: unknown[]) => void>(func: T, delay: number): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
}

export default function Home() {
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [name, setName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [filteredPokemons, setFilteredPokemons] = useState<Pokemon[]>([]);
  const [nextPageUrl, setNextPageUrl] = useState<string | null>(null);
  const [prevPageUrl, setPrevPageUrl] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1); // Track the current page

  const handlePokemonList = async (url: string = "https://pokeapi.co/api/v2/pokemon?limit=8&offset=0"): Promise<void> => {
    setLoading(true);
    const response = await fetch(url);
    const result: PokemonAPIResponse = await response.json();
    
    const updatedPokemons = result.results.map((pokemon) => {
      const id = pokemon.url.split("/").filter(Boolean).pop(); // Extract ID from URL
      const image = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
      
      return {
        ...pokemon,
        image,
      };
    });

    setPokemons(updatedPokemons);
    setFilteredPokemons(updatedPokemons); // Update filteredPokemons when loading new page
    setNextPageUrl(result.next);
    setPrevPageUrl(result.previous);
    setLoading(false);
  };

  // Debounced function to filter Pokémon list based on search term
  const filterPokemons = useCallback(
    debounce((searchTerm: string) => {
      const filtered = pokemons.filter((pokemon) =>
        pokemon.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPokemons(filtered);
    }, 300), // 300ms debounce delay
    [pokemons]
  );

  useEffect(() => {
    handlePokemonList();
  }, []);

  useEffect(() => {
    filterPokemons(name);
  }, [name, filterPokemons]);

  const handlePageChange = (url: string | null, direction: 'next' | 'prev'): void => {
    if (url) {
      setCurrentPage((prev) => direction === 'next' ? prev + 1 : prev - 1);
      handlePokemonList(url);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h2 className="text-3xl font-bold text-center text-green-600 mb-8">
        Pokemon Explorer
      </h2>

      
      <div className="max-w-sm mx-auto mb-10">
        <div className="relative">
          <div className="absolute inset-y-0 start-0 flex items-center pointer-events-none z-20 ps-3.5">
            <svg
              className="shrink-0 size-4 text-gray-400 dark:text-white/60"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.3-4.3"></path>
            </svg>
          </div>
          <input
            value={name}
           
            onChange={(e) => setName(e.target.value)}
            className="py-3 ps-10 pe-4 outline-none border-2 block w-full border-gray-200 rounded-lg text-sm focus:border-green-500 focus:ring-green-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600 drop-shadow-2xl"
            type="text"
            placeholder="Search By Pokemon Name"
            aria-expanded="false"
            data-hs-combo-box-input=""
          />
        </div>
      </div>
      
      <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredPokemons.length > 0 ? (
          filteredPokemons.map((pokemon, index) => (
            <li
              key={index}
              className="bg-white rounded-lg shadow-md p-4 hover:shadow-xl transition duration-300"
            >
              <Link href={`/${pokemon.name}`}>
                <Image 
                  src={pokemon.image} 
                  style={{filter: "drop-shadow(2px 4px 6px black)"}}
                  alt={pokemon.name} 
                  className="w-full drop-shadow-2xl h-40 object-contain mb-4 scale-y-100"
                  width={200}
                  height={200}
                  priority
                />
                <p className="text-lg text-center font-medium text-gray-800 capitalize block">
                  {pokemon.name}
                </p>
              </Link>
            </li>
          ))
        ) : (
          <p className="text-center col-span-4">No Pokemon Found</p>
        )}
      </ul>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-8">
        <button
          onClick={() => handlePageChange(prevPageUrl, 'prev')}
          disabled={!prevPageUrl}
          className={`px-4 py-2 bg-gray-300 rounded ${!prevPageUrl ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-400'}`}
        >
          Previous
        </button>
        <span>Page {currentPage}</span>
        <button
          onClick={() => handlePageChange(nextPageUrl, 'next')}
          disabled={!nextPageUrl || filteredPokemons.length <= 7}
          className={`px-4 py-2 bg-gray-300 rounded ${!nextPageUrl || filteredPokemons.length <= 7 ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-400'}`}
        >
          Next
        </button>
      </div>
    </div>
  );
}
