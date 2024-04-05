import apiData from './pokeapi.js';

// Query valid Pokedex GET request
try {
  let data = await apiData.getPokedexByName('kanto');
  console.log(`[Valid Pokedex GET Succeeded]`);
  console.log(` ↳ data.name: ${data.name}`);
} catch (e) {
  console.log(`[Valid Pokedex GET Failed]`);
  console.log(` ↳ ${e}`);
}
// Query invalid Pokedex GET request
try {
  let data = await apiData.getPokedexByName('bad pokedex name');
  console.log(`[Invalid Pokedex GET Did Not Error]`);
  console.log(` ↳ ${data}`);
} catch (e) {
  console.log(`[Invalid Pokedex GET Failed Successfully]`);
  console.log(` ↳ ${e}`);
}