import { dbConnection, closeConnection } from "../config/mongoConnection.js";
import users from "../data/users.js";
import { createNewDraft, editPokemonValue, editPokemonList, inviteUserToDraft, getDraft, checkInviteForUser, draftPokemonToTeam } from "../data/draft.js";

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
    pokeMaster = await users.createNewUser(
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
    tom = await users.createNewUser(
        tom.username, 
        tom.password, 
        tom.email, 
        tom.dob);
    console.log("pokeMaster created");
    console.log(tom);
} catch(e){
    console.log(e);
}

let pokeMasterDraft;

try{
    pokeMasterDraft = await createNewDraft("1", "pokeMaster", 100, 6, 0);
    console.log("Draft created");
    console.log(pokeMasterDraft);
}catch(e){
    console.log(e);
}

try{
    await inviteUserToDraft(pokeMasterDraft._id, "pokeMaster");
    console.log("Invite sent to pokeMaster");
    await inviteUserToDraft(pokeMasterDraft._id, "catguy");
    console.log("Invite sent to catguy");
}catch(e){
    console.log(e);
}


try{
    await checkInviteForUser(pokeMasterDraft._id, pokeMaster._id, true);
    console.log("Invite accepted by pokeMaster");
    await checkInviteForUser(pokeMasterDraft._id, tom._id, true);
    console.log("Invite accepted by catguy");
}catch(e){
    console.log(e);
}

try {
    let PMTeam = await getTeam(pokeMaster.teams[0]);
    await draftPokemonToTeam(pokeMaster._id, PMTeam._id, "charizard", pokeMasterDraft.pkmn_list, pokeMasterDraft._id);
    console.log("Charizard selected by pokeMaster");
    let CGTeam = await getTeam(tom.teams[0]);
    await draftPokemonToTeam(tom._id, CGTeam._id, "bulbasaur", pokeMasterDraft.pkmn_list, pokeMasterDraft._id);
    console.log("Bulbasaur selected by pokeMaster");
} catch(e){
    console.log(e);
}

let tournament;

try {
    tournament = await createNewTournament(pokeMasterDraft);
    console.log("Tournament created");
} catch(e){
    console.log(e);
}

try {
    tournament.schedule[0].winner = 1;
    await reportMatch(tournament._id, tournament.schedule[0]);
    console.log("Tournament match reported");
} catch(e){
    console.log(e);
}