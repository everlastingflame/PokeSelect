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

export default {
  validateString,
};
