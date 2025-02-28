// pages/index.tsx
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

  // Effect to call the debounced search function when the search term changes
  useEffect(() => {
    filterPokemons(name);
  }, [name, filterPokemons]);

  // Handle page change when clicking on next or previous
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
      <div className="text-center mb-10">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="focus:outline-none rounded-sm border px-14 py-1"
          placeholder="Search By Pokemon Name"
          type="text"
        />
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
                  alt={pokemon.name} 
                  className="w-full h-40 object-contain mb-4 scale-y-100"
                  width={200} // Adjust the width and height as needed
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
          disabled={!nextPageUrl}
          className={`px-4 py-2 bg-gray-300 rounded ${!nextPageUrl ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-400'}`}
        >
          Next
        </button>
      </div>
    </div>
  );
}
