import { users } from "../config/mongoCollections.js";
import { dbData } from "../data/index.js";

if (process.env.NODE_ENV !== "testing") {
  console.error("THIS SCRIPT MUST BE RUN WITH `NODE_ENV=testing`!");
  console.error("EXITING!");
  process.exit();
}
const userCollection = await users();
console.log("Clearing existing collection");
userCollection.deleteMany({});
try {
  let user = await dbData.users.createNewUser("testUser", "mynewpassword", "test@example.com", "10/26/2001");
  console.log(user);
  console.log("New user added successfuly!");
} catch (e) {
  console.log(e);
  console.log("Failed adding new user");
}

process.exit();