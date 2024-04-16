import {team} from '../config/mongoCollections.js';
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