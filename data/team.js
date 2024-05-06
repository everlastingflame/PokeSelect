import { teams, tournaments } from "../config/mongoCollections.js";
import validation from "./data_validation.js";
import { ObjectId } from "mongodb";
import tournamentsData from "./tournaments.js";
import users from "./users.js";
import { getDraft } from "./draft.js";

const createNewTeam = async (user_id, draft_id, points) => {
  user_id = validation.validateId(user_id, "userId");
  draft_id = validation.validateId(draft_id, "draftId");
  points = validation.validateNumber(points, "points");

  if (points < 6) throw "Point budget must be at least 6.";
  await users.getUserById(user_id);
  await getDraft(draft_id);

  let newTeam = {
    user_id: user_id,
    draft_id: draft_id,
    selections: [],
    tera_captain: [],
    points_remaining: points,
    wins: 0,
    losses: 0,
  };

  const teamCollection = await teams();
  const insertInfo = await teamCollection.insertOne(newTeam);
  if (!insertInfo.acknowledged || !insertInfo.insertedId) {
    throw "Error: Could not add team";
  }

  const newId = insertInfo.insertedId.toString();
  const team = await getTeam(newId);
  return team;
};

const getTeam = async (teamId) => {
  teamId = validation.validateId(teamId, "teamId");

  const teamCollection = await teams();
  const team = await teamCollection.findOne({
    _id: new ObjectId(teamId),
  });
  if (team === null) {
    throw `Error: No team with id of ${teamId}`;
  }
  return team;
};

const addPokemonToTeam = async (teamId, pokemonDrafted) => {
  teamId = validation.validateId(teamId, "teamId");
  if (typeof pokemonDrafted !== "object")
    throw "Drafted Pokemon must be an object";
  let team = await getTeam(teamId);
  if (team.points_remaining < pokemonDrafted.point_val)
    throw "You do not have enough points to draft this Pokemon";
  if (pokemonDrafted.point_val < 0)
    throw "Pokemon point value must be 0 or a positive number";
  // have to add more checks regarding min pokemon

  pokemonDrafted.is_drafted = true;
  team.points_remaining = team.points_remaining - pokemonDrafted.point_val;

  let teamCollection = await teams();
  await teamCollection.updateOne(
    { _id: teamId },
    {
      $set: { points_remaining: team.points_remaining },
      $push: { selections: pokemonDrafted },
    }
  );
  return team;
};

const reportMatch = async (tournamentId, tournamentMatch, result) => {
  tournamentId = validation.validateId(tournamentId, "tournamentId");
  if (typeof tournamentMatch !== "object")
    throw "Tournament match must be an object";

  // adds win to team if they won match, add loss otherwise
  let tournament = await tournamentsData.getTournament(tournamentId);
  if (tournament === null) throw "Tournament doesn't exist";

  // check that match is in tournament

  for (let match of tournament.schedule) {
    if(match.team_1.equals(tournamentMatch.team_1) && match.team_2.equals(tournamentMatch.team_2) && match.winner === tournamentMatch.winner) {
      const tournamentCollection = await tournaments();
      const match = await tournamentCollection.findOneAndUpdate(
        {"schedule._id": tournamentMatch._id}, {$set: {"schedule.$.winner": result}});

      console.log(match);

      let team1 = await getTeam(tournamentMatch.team_1);
      let team2 = await getTeam(tournamentMatch.team_2);
      let teamCollection = await teams();

      if (tournamentMatch.winner === 1) {
        await teamCollection.updateOne(
          { _id: team1._id },
          {$set: {wins: team1.wins + 1}}
        )
        await teamCollection.updateOne(
          { _id: team2._id },
          {$set: {losses: team2.losses + 1}}
        )
      } else {
        await teamCollection.updateOne(
          { _id: team1._id },
          {$set: {losses: team1.losses + 1}}
        )
        await teamCollection.updateOne(
          { _id: team2._id },
          {$set: {wins: team2.wins + 1}}
        )
      }
      return tournamentMatch;
    }
  }
  throw "Match is not in the tournament";
};

const selectTeraCaptain = async (teamId, teraPokemon, tera_num_captains) => {
  teamId = validation.validateId(teamId, "teamId");
  teraPokemon = validation.validateString(teraPokemon, "teraPokemon");

  let team = await getTeam(teamId);
  if (!team.selections.includes(teraPokemon))
    throw "Pokemon is not on your team";
  if (!team.tera_captain.includes(teraPokemon))
    throw "Pokemon is already a tera captain for the team";
  if (team.tera_captain.length >= tera_num_captains)
    throw "Team already has maximum number of tera captains";
  for (let pokemon of team.selections) {
    if (pokemon.name === teraPokemon) {
      if (pokemon.is_tera_eligible) {
        team.tera_captain.push(pokemon);
        return teraPokemon.tera_captain;
      } else {
        throw "Pokemon is banned from being a tera captain";
      }
    }
  }
  throw "Pokemon is not eligible to be a tera captain";
};

export default {
  createNewTeam,
  getTeam,
  reportMatch,
  addPokemonToTeam,
  selectTeraCaptain,
};
