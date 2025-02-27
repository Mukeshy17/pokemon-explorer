// pages/pokemon/[name].tsx
import { useState, useEffect } from "react";
import Loader from "@/components/Loader";
import { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";

interface Ability {
  ability: {
    name: string;
    url: string;
  };
}

interface Type {
  type: {
    name: string;
  };
}

interface Stat {
  base_stat: number;
  stat: {
    name: string;
  };
}

interface Move {
  move: {
    name: string;
  };
}

interface Sprites {
  front_default: string;
}

interface PokemonDetail {
  id: number;
  name: string;
  height: number;
  weight: number;
  abilities: Ability[];
  sprites: Sprites;
  types: Type[];
  stats: Stat[];
  moves: Move[];
}

export default function PokemonDetailPage() {
 
  const router = useRouter();
  const { PokemonDetailPage: name } = router.query; // Getting the dynamic Pokemon name from the URL
  const [pokemon, setPokemon] = useState<PokemonDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch Pokemon data on mount
  useEffect(() => {
    const fetchPokemonData = async () => {
      if (!name) return;
      setLoading(true);

      try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
        if (response.ok) {
          const data = await response.json();
          setPokemon(data);
        } else {
          console.error("Error fetching Pokemon data");
        }
      } catch (error) {
        console.error("Error fetching Pokemon data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPokemonData();
  }, [name]);

  if (loading) {
    return <Loader />;
  }

  if (!pokemon) {
    return <div>Pokemon not found!</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <Link href="/">
        <p className="text-blue-500 underline mb-4 inline-block">← Back</p>
      </Link>
      <div className="bg-white flex justify-between gap-4 rounded-lg shadow-md p-6">
        <div className="w-[30%] bg-gray-200 shadow-lg p-4 rounded-lg">
          <h2 className="text-3xl font-bold text-center text-gray-800 capitalize mb-4">
            {pokemon.name}
          </h2>
          {/* <img
            src={pokemon.sprites.front_default}
            alt={pokemon.name}
            className="w-full h-full object-fill"
          /> */}
          <Image
            src={pokemon.sprites.front_default}
            alt={pokemon.name}
            width={200} // Adjust the width and height as needed
            height={200}
            className="w-full h-full object-contain"
            priority 
          />
        </div>
        <div className="w-[70%] bg-white p-6 rounded-lg shadow-lg flex justify-between items-start space-x-6">
          {/* Basic Info Section */}
          <div className="p-4 rounded-lg w-[30%]">
            <p className="text-lg font-semibold text-gray-800 mb-2">
              Basic Info
            </p>
            <p className="text-gray-600">
              <strong>ID:</strong> {pokemon.id}
            </p>
            <p className="text-gray-600">
              <strong>Height:</strong> {pokemon.height}
            </p>
            <p className="text-gray-600">
              <strong>Weight:</strong> {pokemon.weight}
            </p>
          </div>

          {/* Types Section */}
          <div className="p-4 rounded-lg w-[20%]">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Types</h3>
            <ul className="list-disc list-inside space-y-1">
              {pokemon.types.map((typeObj, index) => (
                <li key={index} className="capitalize text-gray-600">
                  {typeObj.type.name}
                </li>
              ))}
            </ul>
          </div>

          {/* Stats Section */}
          <div className="p-4 rounded-lg w-[20%]">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Stats</h3>
            <ul className="list-disc list-inside space-y-1">
              {pokemon.stats.map((statObj, index) => (
                <li key={index} className="text-gray-600">
                  {statObj.stat.name}: <strong>{statObj.base_stat}</strong>
                </li>
              ))}
            </ul>
          </div>

          {/* Moves Section */}
          <div className="p-4 rounded-lg w-[30%]">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Moves</h3>
            <ul className="list-disc list-inside space-y-1">
              {pokemon.moves.slice(0, 10).map((moveObj, index) => (
                <li key={index} className="capitalize text-gray-600">
                  {moveObj.move.name}
                </li>
              ))}
            </ul>
            <p className="text-sm italic text-gray-500">
              Showing first 10 moves...
            </p>
          </div>

          {/* Abilities Section */}
          <div className="p-4 rounded-lg w-[20%]">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Abilities
            </h3>
            <ul className="list-disc list-inside space-y-1">
              {pokemon.abilities.map((abilityObj, index) => (
                <li key={index} className="capitalize text-gray-600">
                  {abilityObj.ability.name}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
