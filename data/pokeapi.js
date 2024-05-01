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


/*
Given a generation called gen, find:
pokedexesForGen = getAllPokedexesForGeneration(gen); --> calls getGameGeneration(gen)
let pokemonInGen = [];
for (pokedex of pokedexesForGen) {
  pokemonInGen.push(getAllPokemonByPokedex(pokedex));
}
pokemonInGen.flat()
// Set gen_suffix by gen
gen = 7
gen_suffix = ... e.g. `$(gen===9 ? '' : 'paldea|')$(gen===7 ? '' : '|alola')$(gen === 8 ? '' : '|galar|hisui')`
suffixRegex = new RegExp(`.*-($(gen_suffix)))
pokemonInGen.filter((e) => !e.name.match(suffixRegex))
}
*/

async function getAllPokemonByGeneration(generationName) { // generationName should be a number 1-9
  generationName = validate.validateString(generationName, "generationName");
  let pokedexesForGen = await getAllPokedexesForGeneration(generationName); // gets all pokedexes for that generation
  let pokemonInGen = new Map();
  for (const pokedex of pokedexesForGen) { // gets all pokemon in that generation, including regional varieties that aren't in gen
    await getAllPokemonByPokedex(pokedex, pokemonInGen);
  }
  let gen = parseInt(generationName);

  let gen_suffix = `${gen===9 ? '' : 'paldea|'}${gen===7 ? '' : 'alola|'}${gen === 8 ? '' : 'galar|hisui'}`;
  let suffixRegex = new RegExp(`.*-(${gen_suffix})`);
  pokemonInGen = [...pokemonInGen].filter((e) => !e.keys().match(suffixRegex)); // filters out regional varieties that aren't in generation
  return pokemonInGen;
}

async function getAllPokemonByPokedex(pokedex, pokemonMap) {
  if(typeof pokedex !== "object") throw "Pokedex must be an object";

  for (const entry of pokedex.pokemon_entries) { // pushes all species varieties to pokemonList
    for (const pokemon of await getAllPokemonFromSpecies(entry.pokemon_species.name)) {
      if(!pokemonMap.get(pokemon.name)) {
        pokemonMap.set(pokemon.name, pokemon);
      }
    }
  }
  return pokemonMap;


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

async function getAllPokemonFromSpecies(speciesName) { // given a pokemon species (i.e. "arcanine"), returns all pokemon entries for each species
  speciesName = validate.validateString(speciesName, "speciesName");
  const endpoint = `${API_URI}/pokemon-species/${encodeURIComponent(speciesName)}`;

  let species = await resolveQuery(endpoint);

  let speciesArray = [];

  for (const variety of species.varieties) {
    if(variety.is_default || variety.pokemon.name.match(/.*-(hisui|galar|alola|paldea)/)) {
      speciesArray.push(await resolveQuery(variety.pokemon.url));
    }
  }

  return speciesArray;
}

async function getGameGeneration(generationName) {
  generationName = validate.validateString(generationName, "generationName");
  const endpoint = `${API_URI}/generation/${encodeURIComponent(generationName)}`;

  let data = await resolveQuery(endpoint);

  return data;

}

async function getAllPokedexesForGeneration(generationName) {
  generationName = validate.validateString(generationName, "generationName");
  let generationData = await getGameGeneration(generationName);
  let pokedexList = [];
  let pokedexNames = new Map();

  for (let game of generationData.version_groups) { // for each game in the generation, returns pokedexes
    let gameURL = await resolveQuery(game.url);
    for (let pokedex of gameURL.pokedexes) {
     if(!pokedexNames.get(pokedex.name)) {
      pokedexList.push(await resolveQuery(pokedex.url));
      pokedexNames.set(pokedex.name, true);
     }
    }
  }
  return pokedexList;

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

export default { getPokedexByName, getAllPokemonByGeneration, getPokemon, getAllPokedexesForGeneration, getAllPokemonByPokedex, getGameGeneration };
