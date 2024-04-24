import {users} from '../config/mongoCollections.js';
import data_validation from '../data/data_validation.js';
import { ObjectId } from "mongodb";

const createNewUser = async (username, password, email, dob) => {
    username = data_validation.validateString(username, "username");
    password = data_validation.validateString(password, "password");
    email = data_validation.validateString(email, "email");
    dob = data_validation.validateDate(dob, "dob");

    // TODO: Hash password with bcrypt
    let password_hash = password;

    let newUser = {
        username: username,
        password_hash: password_hash,
        email: email,
        dob: dob,
        teams: []
    }

    const userCollection = await users();
    const insertInfo = await userCollection.insertOne(newUser);
    if (!insertInfo.acknowledged || !insertInfo.insertedId) {
      throw "Error: Could not add user";
    }
  
    const newId = insertInfo.insertedId.toString();
    const user = await getUser(newId);
    return user;
}

// TODO: Create functions to get user by name and get user by _id
const getUser = async (userid) => {
    userid = data_validation.validateString(userid, "userid");
    const userCollection = await users();
    const user = await userCollection.findOne({
      _id: new ObjectId(userid)
    });
    if (user === null) {
      throw `Error: No user with username ${username}`;
    }
    return user.username;
  };


  const getAll = async () => {
    const userCollection = await users();
    const userList = await userCollection.find({}).toArray();
    return userList;
  };
// TODO: Create addTeam function (add team ObjectId to teams array)

export default {createNewUser, getUser, getAll}