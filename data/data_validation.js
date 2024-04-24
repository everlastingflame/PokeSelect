import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat.js";
import { ObjectId } from "mongodb";
dayjs.extend(customParseFormat);


function validateString(string, name = "string") {
  if (!string) {
    throw `Error: Did not supply ${name}`;
  }
  if (typeof string !== "string") {
    throw `Error: ${name} is type [${typeof string}], not string`;
  }
  string = string.trim();
  if (string.length === 0) {
    throw `Error: ${name} is empty or just spaces`;
  }
  return string;
}

function validateNumber(number, name = "number") {
  if (!number) {
    throw `Error: Did not supply ${name}`;
  }
  if (typeof number !== "number" || Number.isNaN(number)) {
    throw `Error: ${name} is type [${typeof number}], not number`;
  }
  return number;
}

function validateDate(date, name = "date") {
  date = validateString(date, name);

  const _day = dayjs(date, "MM/DD/YYYY", true);
  if (!_day.isValid()) {
    throw `Error: ${date} is invalid`;
  }
  if (_day.isAfter(dayjs(), "day")) {
    throw `Error: ${date} cannot be in the future`;
  }
  if (dayjs().diff(_day, "year") < 13) {
    throw `Error: ${date} user must be at least 13 years old`;
  }

  return date;
}

/**
 * Validates if input is a valid ObjectId given a string or an ObjectId object
 * Returns id as an ObjectId object
 */

function validateId(id, name = "ObjectId") {
  if (!id) {
    throw "Error: You must provide an id to search for";
  }
  if (typeof id !== "string" && typeof id !== "object") {
    throw `Error: ${name} must be a string or an object`;
  }
  if (typeof id === "string") {
    id = id.trim();
    if (id.length === 0) {
      throw `Error: string ${name} cannot be empty or just spaces`;
    }
    id = new ObjectId(id);
  }
  if (!ObjectId.isValid(id)) throw "Error: Invalid ObjectId";
  return id;
}

function validateUsername(username, name = "username") {
  username = validateString(username, name);

  if (username.length < 3 || username.length > 32) {
    throw `Error: ${name} must be between 3 and 32 characters`;
  }
  if (!username.match(/^[a-zA-Z0-9._-]{3,32}$/)) {
    throw `Error: ${name} can only contain characters a-z, A-Z, 0-9, or underscores (_)`;
  }
  return username;
}

function validatePassword(password, name = "password") {
  password = validateString(password, name);

  return password;
}

function validateEmail(email, name = "email") {
  email = validateString(email, name);

  return email;
}

export default {
  validateString,
  validateDate,
  validateId,
  validateUsername,
  validatePassword,
  validateEmail,
};
