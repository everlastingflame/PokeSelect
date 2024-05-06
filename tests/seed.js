import { dbConnection, closeConnection } from "../config/mongoConnection.js";
import users from "../data/users.js";
import { createNewDraft, editPokemonValue, editPokemonList, inviteUserToDraft, getDraft, checkInviteForUser } from "../data/draft.js";

const db = await dbConnection();

//user1
await db.collection("users").drop();


let pokeMaster = {
    username: "pokeMaster",
    password: "Pa$$w0rd",
    email: "pokemaster@gmail.com",
    dob: "1995-03-25"
};

try{
    await users.createNewUser(
        pokeMaster.username, 
        pokeMaster.password, 
        pokeMaster.email, 
        pokeMaster.dob);
    console.log("pokeMaster created");
    console.log(pokeMaster);
} catch(e){
    console.log(e);
}

let tom = {
    username: "catguy",
    password: "Pa$$w0rd",
    email: "catguy@gmail.com",
    dob: "1995-03-25"
};

try{
    await users.createNewUser(
        tom.username, 
        tom.password, 
        tom.email, 
        tom.dob);
    console.log("pokeMaster created");
    console.log(tom);
} catch(e){
    console.log(e);
}

try{
    let pokeMasterDraft = await createNewDraft("8", "pokeMaster", 100, 6, 0);
    console.log("Draft created");
    console.log(pokeMasterDraft);
}catch(e){
    console.log(e);
}
