import {tournaments} from '../config/mongoCollections.js';
import { getDraft } from './draft.js';
import { ObjectId } from "mongodb";
import validation from "./data_validation.js";
import team from "./team.js";

const createNewTournament = async (draft_id) => {
    draft_id = validation.validateId(draft_id);
    let draft = await getDraft(draft_id);
    if(draft === null) throw "Draft ID doesn't exist.";

    let numTeams = draft.team_ids.length;
    // if (numTeams % 2 !== 0) throw "Tournament must have an even number of teams";

    let matches = [];

    if(numTeams < 2) throw "Must have at least 2 teams to start draft";

    for (let i = 0; i < numTeams; i++) {
        for (let j = 0; j < numTeams; j++) {
            if(i < j) {
                matches.push({
                    _id: new ObjectId(),
                    team_1: draft.team_ids[i],
                    team_2: draft.team_ids[j],
                    winner: 0
                })
            }
        }
    }

    // can organize by each week but would require lots of stuff

    let newTournament = {
        user_ids: draft.user_ids,
        team_ids: draft.team_ids,
        draft_id: draft_id,
        schedule: matches
    };

    const tournamentCollection = await tournaments();
    const insertInfo = await tournamentCollection.insertOne(newTournament);
    if (!insertInfo.acknowledged || !insertInfo.insertedId) {
      throw "Error: Could not add tournament";
    }
  
    const newId = insertInfo.insertedId.toString();
    const tournament = await getTournament(newId);
    return tournament;
}

const getTournament = async (tournamentId) => {
    tournamentId = validation.validateId(tournamentId);

    const tournamentCollection = await tournaments();
    const tournament = await tournamentCollection.findOne({
        _id: tournamentId,
    });
    if (tournament === null) {
        throw `Error: No tournament with id of ${tournamentId}`;
    }
    return tournament;
}

// function to detect when match is reported on client side

export default {createNewTournament, getTournament};