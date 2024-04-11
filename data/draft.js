import {draft} from '../config/mongoCollections.js';
import {data_validation, validateId} from './data_validation.js';
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
        draft_master: id,
        pick_number: 1,
        team_size: 0,
        point_budget: point_budget
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
  draftId = validateId(draftId);
  
    const draftCollection = await draft();
    const draft = await draftCollection.findOne({
      _id: new ObjectId(draftId),
    });
    if (draft === null) {
      throw `Error: No draft with id of ${draftId}`;
    }
    return draft;
}

export {createNewDraft, getDraft}