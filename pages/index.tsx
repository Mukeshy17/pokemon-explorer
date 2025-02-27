// pages/index.tsx
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Loader from "@/components/Loader";

interface Pokemon {
  name: string;
  url: string;
}

interface PokemonAPIResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Pokemon[];
}

// Debounce utility function
function debounce<T extends (...args: any[]) => void>(func: T, delay: number): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
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

  const handlePokemonList = async (): Promise<void> => {
    const response = await fetch(
      "https://pokeapi.co/api/v2/pokemon?limit=100&offset=0"
    );
    const result: PokemonAPIResponse = await response.json();
    setPokemons(result.results);
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

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h2 className="text-3xl font-bold text-center text-blue-600 mb-8">
        Pokemon Explorer
      </h2>
      <div className="text-center mb-10">
        <label className="pr-2" htmlFor="">
          Search by Pokemon Name :
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="focus:outline-none rounded-sm border px-4 py-1"
          placeholder="Search"
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
    </div>
  );
}
