import {draft} from '../config/mongoCollections.js';
import {data_validation} from './data_validation.js';
import { ObjectId } from "mongodb";

const createNewDraft = async (dex_name, draft_master, point_budget) => {
    // dex_name = id, can also be name

    // function to get pkmn_list
    //

    let newDraft = {
        user_ids: [],
        team_ids: [],
        tera_banlist: [],
        dex_id: dex_name, // call function to convert name to id
        pkmn_list: pkmn_list,
        draft_master: 0,
        pick_number: 0,
        team_size: 0,
        point_budget: point_budget
    };


    const teamCollection = await team();
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
  
    const teamCollection = await team();
    const team = await teamCollection.findOne({
      _id: new ObjectId(teamId),
    });
    if (team === null) {
      throw `Error: No user with id of ${userId}`;
    }
    return team;
}

export {createNewTeam, getTeam}