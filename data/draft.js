import {drafts, users} from '../config/mongoCollections.js';
import userfunctions from "./users.js";
import team from "./team.js";
import validation from './data_validation.js';
import { ObjectId } from "mongodb";
import pokeapi from "./pokeapi.js";

const createNewDraft = async (generationName, draft_master, point_budget, team_size, tera_num_captains) => {
    generationName = validation.validateString(generationName, "generationName");
    draft_master = validation.validateString(draft_master, "draftMaster");
    point_budget = validation.validateNumber(point_budget);
    team_size = validation.validateNumber(team_size);
    if(generationName === "9") {
      tera_num_captains = validation.validateNumber(tera_num_captains);
      if(tera_num_captains < 0 || tera_num_captains > team_size) throw "The number of tera captains can't be a negative number or greater than the team size";
    }

    if(point_budget < 6) throw "Point budget must be at least 6 so a team of 6 Pokemon can be drafted";
    if(team_size < 6) throw "Team size must be at least 6";

    let old_pkmn_list = await pokeapi.getAllPokemonByGeneration(generationName);
    let pkmn_list = [];
    for (let pokemon of old_pkmn_list) {
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
        name: pokemon.name,
        pkmn_id: pokemon.id,
        point_val: 1,
        is_drafted: false,
        is_tera_eligible: true,
        types: types,
        abilities: abilities,
        stats: stats
      })
    }

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


    const draftCollection = await drafts();
    const insertInfo = await draftCollection.insertOne(newDraft);
    if (!insertInfo.acknowledged || !insertInfo.insertedId) {
      throw "Error: Could not add draft";
    }
  
    const newId = insertInfo.insertedId.toString();
    const draft = await getDraft(newId);
    return draft;
}

const getDraft = async(draftId) => {
  draftId = validation.validateId(draftId);
  
    const draftCollection = await drafts();
    const draft = await draftCollection.findOne({
      _id: new ObjectId(draftId),
    });
    if (draft === null) {
      throw `Error: No draft with id of ${draftId}`;
    }
    return draft;
}

const editPokemonList = async (pkmn_list, banned_pkmn, tera_banned_pkmn) => {
  // pkmn_list is list of all pokemon in gen, banned_pkmn can't be selected, tera_banned_pkmn can't be tera captain
  if(typeof pkmn_list !== "object" || !Array.isArray(pkmn_list)) throw "No Pokemon list provided";
  for (let pokemon of pkmn_list) {
    if(typeof pokemon !== "object") throw "All array elements must be objects";
  }

  if(typeof banned_pkmn !== "object" || !Array.isArray(banned_pkmn)) throw "No banned Pokemon list provided";
  banned_pkmn = banned_pkmn.map((e) => validation.validateString(e, "banned Pokemon"));

  if(typeof tera_banned_pkmn !== "object" || !Array.isArray(tera_banned_pkmn)) throw "No tera banned Pokemon list provided";
  tera_banned_pkmn = tera_banned_pkmn.map((e) => validation.validateString(e, "tera banned Pokemon"));

  for (let pokemon of pkmn_list) {
    if(banned_pkmn.includes(pokemon.name)) { // sets point_val of undraftable pokemon to -1, will use to filter out of draft board
      pokemon.point_val = -1;
    }
    if(tera_banned_pkmn.includes(pokemon.name)) {
      pokemon.is_tera_eligible = false;
    }
  }
  return pkmn_list;
}

const editPokemonValue = async (pkmn_list, pokemon, value) => {
  if(typeof pkmn_list !== "object" || !Array.isArray(pkmn_list)) throw "No Pokemon list provided";
  pokemon = validation.validateString(pokemon, "Pokemon");
  value = validation.validateNumber(number, "point value");
  if(value < 0) throw "Point value must be 0 or a positive number";

  for(pkmn of pkmn_list) {
    if(pkmn.name === pokemon) {
      pkmn.point_val = val;
      return pkmn;
    }
  }
  throw "Pokemon is not in the Pokemon list";
}

const draftPokemonToTeam = async (user_id, team_id, draftedPokemon, pkmn_list, draftId) => {
  draftId = validation.validateId(draftId);
  user_id = validation.validateId(user_id);
  team_id = validation.validateId(team_id);
  draftedPokemon = validation.validateString(draftedPokemon, "draftedPokemon");
  if(typeof pkmn_list !== "object" || !Array.isArray(pkmn_list)) throw "No Pokemon list provided";
  for (pokemon of pkmn_list) {
    if(typeof pokemon !== "object") throw "All array elements must be objects";
  }

  let draft = await getDraft(draftId);
  let user = await userfunctions.getUserById(user_id);

  if(draft === null) throw "Draft ID doesn't exist";
  if(user === null) throw "User ID doesn't exist";

  if (!draft.user_ids.includes(user_id)) throw "The user_id provided is not in this draft";
  if (!user.teams.includes(team_id)) throw "The user does not have a team with the team_id provided";
  for (let pokemon of pkmn_list) {
    if(pokemon.name === draftedPokemon.name && !pokemon.is_drafted) {
      let team = await team.addPokemonToTeam(team_id, draftPokemonToTeam);
      pokemon = draftedPokemon;
      draft.pick_number++;
      return team;
    }
  }
  throw "Pokemon selected cannot be drafted";
}

const inviteUserToDraft = async (draftId, username) => {
  draftId = validation.validateId(draftId);
  username = validation.validateString(username);

  const userCollection = await users();
  const user = await userCollection.findOne(
    {"username": username}
  );
  if (user === null) throw "User does not exist";

  if(user.invites.includes(draftId.toString())) throw "This user has already been invited to the draft";

  await userCollection.updateOne(
    {"username": username}, {$push: {invites: draftId.toString()}}
  )

  return user;
}

// function to add users and teams to draft
const checkInviteForUser = async (draft_id, user_id, accept_invite) => {
  if(!draft_id || !ObjectId.isValid(draft_id)) throw "Valid draft ID must be provided";
  if(!user_id || !ObjectId.isValid(user_id)) throw "Valid user ID must be provided";
  if(typeof accept_invite !== "boolean") throw "Invite must be accepted or declined";

  let draft = await getDraft(draft_id);
  let user = await userfunctions.getUserById(user_id);

  if(!user.invites.includes(draft._id.toString())) throw "This user was not invited to the draft";

  const userCollection = await users();
  user = await userCollection.findOneAndUpdate(
    {_id: user_id},
    {$pull: {invites: draft_id}}
  );

  if(accept_invite) {
    if (draft.user_ids.includes(user_id)) throw "This user is already in the draft";
    draft.user_ids.push(user_id);

    let newTeam = await team.createNewTeam(user_id, draft_id, draft.point_budget);
    user.teams.push(newTeam._id)
    draft.team_ids.push(newTeam._id);
  }

  return draft;
}

// finds the user's team in a given draft if it exists
const findUserTeamInDraft = async (user_id, draft_id) => {
  if(!draft_id || !ObjectId.isValid(draft_id)) throw "Valid draft ID must be provided";
  if(!user_id || !ObjectId.isValid(user_id)) throw "Valid user ID must be provided";

  let draft = await getDraft(draft_id);
  let user = await userfunctions.getUserById(user_id);
  if(draft === null) throw "Draft ID doesn't exist";
  if(user === null) throw "User ID doesn't exist";

  if(!draft.user_ids.includes(user_id)) throw "This user is not in this draft";
  for (team of draft.team_ids) {
    if (user.teams.includes(team._id)) {
      return team;
    }
  }
  throw "User does not have a team in this draft";
}

export {createNewDraft, getDraft, inviteUserToDraft, editPokemonList, checkInviteForUser, findUserTeamInDraft}