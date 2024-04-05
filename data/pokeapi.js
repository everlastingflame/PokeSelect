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

async function resolveQuery(url) {
  try {
    let { data } = await axios.get(url);

    return data;
  } catch (e) {
    throw `${e.name}: ${e.message}`;
  }
}

export default { getPokedexByName };
