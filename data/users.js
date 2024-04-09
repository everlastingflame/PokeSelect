import {users} from '../config/mongoCollections.js';
import {data_validation} from '../data/data_validation.js';
import { ObjectId } from "mongodb";

const createNewUser = async (username, password, email, dob) => {
    username = data_validation.validateString(username, "username");
    password = data_validation.validateString(password, "password");
    email = data_validation.validateString(email, "email");
    dob = data_validation.validateDate(dob, "dob");

    let newUser = {
        username: username,
        password: password,
        email: email,
        dob: dob,
        teams: [],
        age : age
    }


    const userCollection = await users();
    const insertInfo = await userCollection.insertOne(newUser);
    if (!insertInfo.acknowledged || !insertInfo.insertedId) {
      throw "Error: Could not add user";
    }
  
    const newId = insertInfo.insertedId.toString();
    const user = await get(newId);
    return user;
}

const get = async (userId) => {
    userId = helpers.validateId(userId);
  
    const userCollection = await users();
    const user = await userCollection.findOne({
      _id: new ObjectId(userId),
    });
    if (user === null) {
      throw `Error: No user with id of ${userId}`;
    }
    return product;
  };

export default {createNewUser, getUser}