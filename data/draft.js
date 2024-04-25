import {draft, users} from '../config/mongoCollections.js';
import userfunctions from "./users.js";
import {getTeam, addPokemonToTeam} from "./team.js";
import validation from './data_validation.js';
import { ObjectId } from "mongodb";
import pokeapi from "./pokeapi.js";

const createNewDraft = async (generationName, draft_master, point_budget, team_size, tera_num_captains) => {
    generationName = validation.validateString(generationName, "generationName");
    draft_master = validation.validateString(draft_master, "draftMaster");
    point_budget = validation.validateNumber(point_budget);
    team_size = validation.validateNumber(team_size);
    tera_num_captains = validation.validateNumber(tera_num_captains);

    let old_pkmn_list = await pokeapi.getAllPokemonByGeneration(generationName);
    let pkmn_list;
    for (let pokemon of pkmn_list) {
      let types = [];
      let abilities = [];
      let stats = {};
      for (let type of pokemon.types) {
        types.push(type.type.name);
      }
      for (let ability of pokemon.abilities) {
        abilities.push(ability.ability.name);
      }
      for (let stat of pokemon.stats) {
        stats[stat.stat.name] = stat.base_stat;
      }
      pkmn_list.push({
        pkmn_name: pokemon.name,
        pkmn_id: pokemon.id,
        point_val: 1,
        is_drafted: false,
        types: types,
        abilities: abilities,
        stats: stats
      })
    }
    if(point_budget < 6) throw "Point budget must be at least 6 so a team of 6 Pokemon can be drafted";
    if(team_size < 6) throw "Team size must be at least 6";
    if(tera_num_captains < 0 || tera_num_captains > team_size) throw "The number of tera captains can't be a negative number or greater than the team size";

    let usersCollection = await users();
    const user = await usersCollection.findOne({username: draft_master});
    if(user === null) throw "This user cannot be the draft master.";

    let gen_num = parseInt(generationName);

    let newDraft = {
        user_ids: [],
        team_ids: [],
        tera_banlist: [],
        gen_num: gen_num, // renamed dex_id to gen_num
        pkmn_list: pkmn_list,
        draft_master: user._id,
        pick_number: 1,
        team_size: team_size,
        point_budget: point_budget,
        tera_num_captains: tera_num_captains
    };


    const draftCollection = await draft();
    const insertInfo = await draftCollection.insertOne(newDraft);
    if (!insertInfo.acknowledged || !insertInfo.insertedId) {
      throw "Error: Could not add draft";
    }
  
    const newId = insertInfo.insertedId.toString();
    const draft = await getTeam(newId);
    return draft;
}

const getDraft = async(draftId) => {
  draftId = validation.validateId(draftId);
  
    const draftCollection = await draft();
    const draft = await draftCollection.findOne({
      _id: new ObjectId(draftId),
    });
    if (draft === null) {
      throw `Error: No draft with id of ${draftId}`;
    }
    return draft;
}

const editPokemonList = async (pkmn_list, banned_pkmn) => {
  // sets point_val of undraftable pokemon to -1, will use to filter out of draft board
  for (pokemon of pkmn_list) {
    if(banned_pkmn.includes(pokemon.name)) {
      pokemon.point_val = -1;
    }
  }
  return pkmn_list;
}

const draftPokemonToTeam = async (user_id, team_id, draftedPokemon, pkmn_list, draftId) => {
  let draft = await getDraft(draftId);
  let user = await userfunctions.getUserById(user_id);

  if (!draft.user_ids.includes(user_id)) throw "The user_id provided is not in this draft";
  if (!user.teams.includes(team_id)) throw "The user does not have a team with the team_id provided";
  for (let pokemon of pkmn_list) {
    if(pokemon.name === draftedPokemon.name && !pokemon.is_drafted) {
      let team = await addPokemonToTeam(team_id, draftPokemonToTeam);
      pokemon = draftedPokemon;
      return team;
    }
  }
  throw "Pokemon selected cannot be drafted";
}

export {createNewDraft, getDraft}