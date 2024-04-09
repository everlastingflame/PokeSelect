import { ObjectId } from "mongodb";
import { users } from "../config/mongoCollections.js";
import validation from "../data/data_validation.js";

async function createNewUser(username, password, email, dob) {
  username = validation.validateString(username, "username");
  password = validation.validateString(password, "password");
  email = validation.validateString(email, "email");
  dob = validation.validateDate(dob, "dob");

  // TODO: Hash password with bcrypt
  let password_hash = password;

  let newUser = {
    username: username,
    password_hash: password_hash,
    email: email,
    dob: dob,
    teams: [],
    age: age,
  };

  const userCollection = await users();
  const insertInfo = await userCollection.insertOne(newUser);
  if (!insertInfo.acknowledged || !insertInfo.insertedId) {
    throw "Error: Could not add user";
  }

  const newId = insertInfo.insertedId.toString();
  const user = await get(newId);
  return user;
}

async function getUserById(userId) {
  userId = validation.validateId(userId);

  const userCollection = await users();
  const user = await userCollection.findOne({
    _id: userId,
  });
  if (user === null) {
    throw `Error: No user exists with id of ${userId}`;
  }
  return user;
}

async function getUserByName(username) {
  username = validation.validateUsername(username);

  const userCollection = await users();
  const user = await userCollection.findOne({
    name: username,
  });
  if (user === null) {
    throw `Error: No user exists with username "${username}"`;
  }
  return user;
}

// TODO: Create addTeam function (add team ObjectId to teams array)

export default { createNewUser, getUserByName, getUserById };
