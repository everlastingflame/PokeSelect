import { dbConnection } from "./mongoConnection.js";

const getCollectionFn = (collection) => {
  let _col = undefined;

  return async () => {
    if (!_col) {
      const db = await dbConnection();
      _col = await db.collection(collection);
    }

    return _col;
  };
};

let _users;
if (process.env.NODE_ENV === "testing") {
  _users = getCollectionFn("test_users");
} else {
  _users = getCollectionFn("users");
}
export const users = _users;
export const teams = getCollectionFn("team");
export const drafts = getCollectionFn("draft");
export const tournaments = getCollectionFn("tournament");
export const mongoCache = getCollectionFn("_cache");
