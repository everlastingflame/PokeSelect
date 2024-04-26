import {tournaments} from '../config/mongoCollections.js';
import { getDraft } from './draft.js';

const createNewTournament = async (draft_id) => {
    let draft = await getDraft(draft_id);
    if(draft === null) throw "Draft ID doesn't exist.";

    let numTeams = draft.team_ids.length();
    if (numTeams % 2 !== 0) throw "Tournament must have an even number of teams";

    let matches = [];

    for (let i = 0; i < numTeams; i++) {
        for (let j = 0; j < numTeams; j++) {
            if(i < j) {
                matches.push({
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
        schedule: matches
    };


    const tournamentCollection = await tournaments();
    const insertInfo = await tournamentCollection.insertOne(newTournament);
    if (!insertInfo.acknowledged || !insertInfo.insertedId) {
      throw "Error: Could not add tournament";
    }
  
    const newId = insertInfo.insertedId.toString();
    const tournament = await getTeam(newId);
    return tournament;
}

const getTournament = async(tournamentId) => {
    tournamentId = validation.validateId(tournamentId);

    const tournamentCollection = await tournaments();
    const tournament = await draftCollection.findOne({
        _id: new ObjectId(tournamentId),
    });
    if (tournament === null) {
        throw `Error: No draft with id of ${tournamentId}`;
    }
    return tournament;
}



export default {createNewTournament, getTournament};