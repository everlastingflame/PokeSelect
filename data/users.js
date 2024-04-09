import { ObjectId } from "mongodb";
import { users } from "../config/mongoCollections.js";
import validation from "../data/data_validation.js";

// TODO: Finish implementing createNewUser()
async function createUser(username, password, email, dob) {
  username = validation.validateUsername(username);
  password = validation.validatePassword(password);
  email = validation.validateEmail(email);
  dob = validation.validateDate(dob, "Date of Birth");

  // TODO: Hash password with bcrypt
  let password_hash = password;

  // TODO: Get age from date of birth

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
    throw `Error: Failed to add user "${username}"`;
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

export default { createUser, getUserByName, getUserById, addTeamToUser };
