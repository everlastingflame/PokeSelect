import {teams} from '../config/mongoCollections.js';
import {data_validation} from './data_validation.js';
import { ObjectId } from "mongodb";

const createNewTeam = async (user_id, draft_id, points) => {
    if(!getUserById(user_id)) throw "User ID doesn't exist.";
    // if(!getDraft(draft_id)) throw "Draft ID doesn't exist.";

    let newTeam = {
        user_id: user_id,
        draft_id: draft_id,
        selections: [],
        tera_captain: [],
        points_remaining: points,
        wins: 0,
        losses: 0
    };


    const teamCollection = await teams();
    const insertInfo = await teamCollection.insertOne(newTeam);
    if (!insertInfo.acknowledged || !insertInfo.insertedId) {
      throw "Error: Could not add user";
    }
  
    const newId = insertInfo.insertedId.toString();
    const team = await getTeam(newId);
    return team;
}

const getTeam = async(teamId) => {
    teamId = helpers.validateId(teamId);
  
    const teamCollection = await teams();
    const team = await teamCollection.findOne({
      _id: new ObjectId(teamId),
    });
    if (team === null) {
      throw `Error: No user with id of ${userId}`;
    }
    return team;
}

const addPokemonToTeam = async (teamId, pokemonDrafted) => {
  let team = getTeam(teamId);
  if(team.points_remaining < pokemonDrafted.point_val) throw "You do not have enough points to draft this Pokemon";
  // have to add more checks regarding min pokemon

  pokemonDrafted.is_drafted = true;
  team.points_remaining = team.points_remaining - pokemonDrafted.point_val;
  team.selections.push(pokemonDrafted);
  return pokemonDrafted;
}

const reportMatch = async (teamId, result) => {
  // adds win to team if they won match, add loss otherwise
}

export default {createNewTeam, getTeam, reportMatch, addPokemonToTeam}