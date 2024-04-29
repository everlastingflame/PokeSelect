import bcrypt from "bcryptjs";
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

  let existingEmail = await userCollection.findOne({
    email: email,
  });
  if (existingEmail) {
    throw `Error: The email ${email} is already in use`;
  }

  let password_hash = await bcrypt.hash(password, cost_factor);

  dob = dayjs(dob, "YYYY-MM-DD", true);
  let age = dayjs().diff(dob, "year");

  let newUser = {
    username: username,
    password_hash: password_hash,
    email: email,
    dob: dob,
    teams: [],
    age: age,
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
    username: username,
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

export const loginUser = async (username, password) => {
  //try catching here to obfuscate error
  try {
    username = validation.validateUsername(username);
    password = validation.validatePassword(password);
  } catch (e) {
    throw "Either the username or password is invalid";
  }

  const userCollection = await users();
  const user = await userCollection.findOne({
    username: username,
  });
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    throw "password is invalid";
  }

  let _id = user._id;

  return { id: _id, username: username };
};

export default {
  createNewUser,
  getUserByName,
  getUserById,
  addTeamToUser,
  loginUser,
};
