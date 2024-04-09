import axios from "axios";
import NodeCache from "node-cache";
import validate from "./data_validation.js";

/**
 * Step 0: Initialize new NodeCache instance
 * Step 1: Function requesting specific data is called.
 * Step 2: Calls helper function to resolve the api GET using NodeCache if cached.
 * Step 3: Return API response from both functions.
 */

const API_URI = "https://pokeapi.co/api/v2";
const cache = new NodeCache();

async function getPokedexByName(pokedexName) {
  pokedexName = validate.validateString(pokedexName, "pokedexName");

  const endpoint = `${API_URI}/pokedex/${encodeURIComponent(pokedexName)}`;

  let data = await resolveQuery(endpoint);

  return data;
}

async function getAllPokemonByPokedex(pokedexName) {
  pokedex = getPokedexByName(pokedexName);
  // find way to get all pokemon using pokedex.pokemon_entries.pokemon_species
  /**
   * Step 1: get array of entries by podex.pokemon_entries
   * Step 2: for each entry object, query api for species using pokemon_species.url
   * Step 3: (in species response) for each variety object in response.varieties,
   *         query variety_obj.url if pokemon suffix is not gmax/mega and gen is valid for region
   */
}

async function getPokemon(pokemonName) {
  pokemonName = validate.validateString(pokemonName, "pokemonName");
  const endpoint = `${API_URI}/pokemon/${encodeURIComponent(pokemonName)}`;

  let data = await resolveQuery(endpoint);

  return data;

}

async function getPokemonSpecies(pokemonName) {
  pokemonName = validate.validateString(pokemonName, "pokemonName");
  const endpoint = `${API_URI}/pokemon-species/${encodeURIComponent(pokemonName)}`;

  let data = await resolveQuery(endpoint);

  /* 
  Get species of said pokemon
  Check if varieties array is > 1
  If > 1, check name of each suffix
  Ignore if mega or gmax, do something if regional suffix (i.e. hisui)
  */


  return data;

}

async function getGameGeneration(generationName) {
  generationName = validate.validateString(generationName, "generationName");
  const endpoint = `${API_URI}/generation/${encodeURIComponent(generationName)}`;

  let data = await resolveQuery(endpoint);

  return data;

}

async function resolveQuery(url) {
  // Return query result from node-cache if previously cached
  let cachedValue = cache.get(url);
  if (cachedValue) {
    return cachedValue;
  }

  // Otherwise, request the result from PokeAPI with a 20 second timeout
  try {
    let { data } = await axios.get(url, { timeout: 20 * 1000 });

    // If successful, cache the result for 1 hour
    cache.set(url, data, 1000 * 60 * 60);

    return data;
  } catch (e) {
    throw `${e.name}: ${e.message}`;
  }

}

export default { getPokedexByName, getPokemon, getGameGeneration };
