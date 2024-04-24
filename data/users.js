import bcrypt from "bcrypt";
import dayjs from "dayjs";
import { ObjectId } from "mongodb";

import { users } from "../config/mongoCollections.js";
import validation from "../data/data_validation.js";

const cost_factor = 12;

// TODO: Finish implementing createNewUser()
async function createNewUser(username, password, email, dob) {
  username = validation.validateUsername(username);
  password = validation.validatePassword(password);
  email = validation.validateEmail(email);
  dob = validation.validateDate(dob, "Date of Birth");


  const userCollection = await users();
  let user = await userCollection.findOne({
    username: username,
  });
  if (user) {
    throw `Error: The username ${username} is already in use`;
  }

  let password_hash = await bcrypt.hash(password, cost_factor);

  dob = dayjs(dob, "MM/DD/YYYY", true);
  let age = dayjs().diff(dob, "year");

  let newUser = {
    username: username,
    password_hash: password_hash,
    email: email,
    dob: dob,
    teams: [],
    age: age
  };

  const insertInfo = await userCollection.insertOne(newUser);
  if (!insertInfo.acknowledged || !insertInfo.insertedId) {
    throw `Error: Failed to add user "${username}"`;
  }

  const newId = insertInfo.insertedId.toString();
  user = await getUserById(newId);
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

// Adds team_id ObjectId to the user with id user_id
async function addTeamToUser(user_id, team_id) {
  user_id = validation.validateId(user_id);
  team_id = validation.validateId(team_id);

  const userCollection = await users();
  const updatedUser = await userCollection.findOneAndUpdate(
    { _id: team_id },
    { $push: { teams: team_id } },
    { returnDocument: "after" }
  );

  if (!updatedUser) {
    throw `Error: Failed to add team to user with id "${user_id}"`;
  }
  return updatedUser;
}

export default { createNewUser, getUserByName, getUserById, addTeamToUser };
