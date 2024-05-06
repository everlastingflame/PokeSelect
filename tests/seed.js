import { dbConnection, closeConnection } from "../config/mongoConnection.js";
import users from "../data/users.js";
import tournament from "../data/tournaments.js";
import team from "../data/team.js";
import { getDraft, createNewDraft, inviteUserToDraft, editPokemonList, checkInviteForUser, draftPokemonToTeam } from "../data/draft.js";

const db = await dbConnection();

await db.collection("users").drop();
await db.collection("team").drop();
await db.collection("draft").drop();
await db.collection("tournament").drop();


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

let gaming1 = {
    username: "gaming1",
    password: "Testing1#",
    email: "gamer1@gmail.com",
    dob: "2000-03-25"
};

try{
    gaming1 = await users.createNewUser(
        gaming1.username, 
        gaming1.password, 
        gaming1.email, 
        gaming1.dob);
    console.log("gaming1 created");
    console.log(gaming1);
} catch(e){
    console.log(e);
}

let gaming2 = {
    username: "gaming2",
    password: "Testing12#",
    email: "gamer2@gmail.com",
    dob: "2000-03-25"
};

try{
    gaming2 = await users.createNewUser(
        gaming2.username, 
        gaming2.password, 
        gaming2.email, 
        gaming2.dob);
    console.log("gaming2 created");
    console.log(gaming2);
} catch(e){
    console.log(e);
}

let pokeMasterDraft;

try{
    pokeMasterDraft = await createNewDraft("1", pokeMaster.username, 100, 6, 0);
    console.log("Draft created");
    // console.log(pokeMasterDraft);
}catch(e){
    console.log(e);
}

try{
    let pokemasterDraft = getDraft(pokeMasterDraft._id);
    await editPokemonList(pokeMasterDraft._id, pokeMasterDraft.pkmn_list, [], []);
    console.log("Edited draft settings");
    // console.log(pokeMasterDraft);
}catch(e){
    console.log(e);
}

try{
    await inviteUserToDraft(pokeMasterDraft._id, pokeMaster.username);
    console.log("Invite sent to pokeMaster");
    await inviteUserToDraft(pokeMasterDraft._id, tom.username);
    console.log("Invite sent to catguy");
    await inviteUserToDraft(pokeMasterDraft._id, gaming1.username);
    console.log("Invite sent to gaming3");
    await inviteUserToDraft(pokeMasterDraft._id, gaming2.username);
    console.log("Invite sent to gaming2");
}catch(e){
    console.log(e);
}


try{
    await checkInviteForUser(pokeMasterDraft._id, pokeMaster._id, true);
    console.log("Invite accepted by pokeMaster");
    await checkInviteForUser(pokeMasterDraft._id, tom._id, true);
    console.log("Invite accepted by catguy");
    await checkInviteForUser(pokeMasterDraft._id, gaming1._id, true);
    console.log("Invite accepted by gaming1");
    await checkInviteForUser(pokeMasterDraft._id, gaming2._id, true);
    console.log("Invite accepted by gaming2");
}catch(e){
    console.log(e);
}

try {
    pokeMaster = await users.getUserByName("pokeMaster");
    tom = await users.getUserByName("catguy");
    gaming1 = await users.getUserByName("gaming1");
    gaming2 = await users.getUserByName("gaming2");
    pokeMasterDraft = await getDraft(pokeMasterDraft._id);
} catch (e) {
    console.log(e);
}

try {
    let PMTeam = await team.getTeam(pokeMaster.teams[0]._id);
    let CGTeam = await team.getTeam(tom.teams[0]._id);
    let G1Team = await team.getTeam(gaming1.teams[0]._id);
    let G2Team = await team.getTeam(gaming2.teams[0]._id);
    await draftPokemonToTeam(pokeMaster._id, PMTeam._id, "charizard", pokeMasterDraft._id);
    console.log("Charizard selected by pokeMaster");
    await draftPokemonToTeam(tom._id, CGTeam._id, "bulbasaur", pokeMasterDraft._id);
    console.log("Bulbasaur selected by catguy");
    await draftPokemonToTeam(gaming1._id, G1Team._id, "ivysaur", pokeMasterDraft._id);
    console.log("Ivysaur selected by gaming1");
    await draftPokemonToTeam(gaming2._id, G2Team._id, "pikachu", pokeMasterDraft._id);
    console.log("Pikachu selected by gaming2");

    await draftPokemonToTeam(pokeMaster._id, PMTeam._id, "charmander", pokeMasterDraft._id);
    console.log("Charmander selected by pokeMaster");
    await draftPokemonToTeam(tom._id, CGTeam._id, "dragonite", pokeMasterDraft._id);
    console.log("Dragonite selected by catguy");
    await draftPokemonToTeam(gaming1._id, G1Team._id, "caterpie", pokeMasterDraft._id);
    console.log("Caterpie selected by gaming1");
    await draftPokemonToTeam(gaming2._id, G2Team._id, "pidgeotto", pokeMasterDraft._id);
    console.log("Pidgeotto selected by gaming2");

    await draftPokemonToTeam(pokeMaster._id, PMTeam._id, "ekans", pokeMasterDraft._id);
    console.log("Ekans selected by pokeMaster");
    await draftPokemonToTeam(tom._id, CGTeam._id, "slowbro", pokeMasterDraft._id);
    console.log("Slowbro selected by catguy");
    await draftPokemonToTeam(gaming1._id, G1Team._id, "golem", pokeMasterDraft._id);
    console.log("Golem selected by gaming1");
    await draftPokemonToTeam(gaming2._id, G2Team._id, "zubat", pokeMasterDraft._id);
    console.log("Zubat selected by gaming2");

    await draftPokemonToTeam(pokeMaster._id, PMTeam._id, "meowth", pokeMasterDraft._id);
    console.log("Meowth selected by pokeMaster");
    await draftPokemonToTeam(tom._id, CGTeam._id, "machamp", pokeMasterDraft._id);
    console.log("Machamp selected by catguy");
    await draftPokemonToTeam(gaming1._id, G1Team._id, "voltorb", pokeMasterDraft._id);
    console.log("Voltorb selected by gaming1");
    await draftPokemonToTeam(gaming2._id, G2Team._id, "hypno", pokeMasterDraft._id);
    console.log("Hypno selected by gaming2");

    await draftPokemonToTeam(pokeMaster._id, PMTeam._id, "haunter", pokeMasterDraft._id);
    console.log("Haunter selected by pokeMaster");
    await draftPokemonToTeam(tom._id, CGTeam._id, "seaking", pokeMasterDraft._id);
    console.log("Seaking selected by catguy");
    await draftPokemonToTeam(gaming1._id, G1Team._id, "staryu", pokeMasterDraft._id);
    console.log("Staryu selected by gaming1");
    await draftPokemonToTeam(gaming2._id, G2Team._id, "magmar", pokeMasterDraft._id);
    console.log("Magmar selected by gaming2");

    await draftPokemonToTeam(pokeMaster._id, PMTeam._id, "mr-mime", pokeMasterDraft._id);
    console.log("Mr. Mime selected by pokeMaster");
    await draftPokemonToTeam(tom._id, CGTeam._id, "magikarp", pokeMasterDraft._id);
    console.log("Magikarp selected by catguy");
    await draftPokemonToTeam(gaming1._id, G1Team._id, "eevee", pokeMasterDraft._id);
    console.log("Eevee selected by gaming1");
    await draftPokemonToTeam(gaming2._id, G2Team._id, "porygon", pokeMasterDraft._id);
    console.log("Porygon selected by gaming2");
} catch(e){
    console.log(e);
}

let tournament1;

try {
    tournament1 = await tournament.createNewTournament(pokeMasterDraft._id);
    console.log("Tournament created");
} catch(e){
    console.log(e);
}

try {
    tournament1 = await tournament.getTournament(tournament1._id);
    await team.reportMatch(tournament1._id, tournament1.schedule[0], 1);
    console.log("Tournament match reported");

    await team.reportMatch(tournament1._id, tournament1.schedule[1], 2);
    console.log("Tournament match reported");

    await team.reportMatch(tournament1._id, tournament1.schedule[2], 2);
    console.log("Tournament match reported");

    await team.reportMatch(tournament1._id, tournament1.schedule[3], 1);
    console.log("Tournament match reported");
} catch(e){
    console.log(e);
}

await closeConnection();