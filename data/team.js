import {teams} from '../config/mongoCollections.js';
import {data_validation} from './data_validation.js';
import { ObjectId } from "mongodb";
import {getTournament} from "./tournaments.js";

const createNewTeam = async (user_id, draft_id, points) => {
    if(!await getUserById(user_id)) throw "User ID doesn't exist.";
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

const reportMatch = async (tournamentId, tournamentMatch) => {
  // adds win to team if they won match, add loss otherwise
  let tournament = await getTournament(tournamentId);
  if(tournament === null) throw "Tournament doesn't exist";

  // check that match is in tournament

  if (!tournament.schedule.includes(tournament)) throw "Match is not in the tournament";

  let team1 = getTeam(tournamentMatch.team_1);
  let team2 = getTeam(tournamentMatch.team_2);

  if(tournamentMatch.winner === 1) {
    team1.wins++;
    team2.losses++;
  } else {
    team1.losses++;
    team2.wins++;
  }
  return tournamentMatch;
}

const selectTeraCaptain = async (teamId, teraPokemon, pkmn_list) => {
  let team = await getTeam(teamId);
  if (!team.selections.includes(teraPokemon)) throw "Pokemon is not on your team";
  if (!team.tera_captain.includes(teraPokemon)) throw "Pokemon is already a tera captain for the team";
  for (pokemon of pkmn_list) {
    if (pokemon.name === teraPokemon) {
      if (pokemon.is_tera_eligible) {
        team.tera_captain.push(teraPokemon);
        return teraPokemon.tera_captain;
      } else {
        throw "Pokemon is banned from being a tera captain";
      }
    }
  }
  throw "Pokemon is not eligible to be drafted";
}

export default {createNewTeam, getTeam, reportMatch, addPokemonToTeam, selectTeraCaptain}