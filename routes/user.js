import data_validation from "../data/data_validation.js";
import express from "express";
import { dbData } from "../data/index.js";
import xss from "xss";
import users from "../data/users.js";
import {getDraft} from "../data/draft.js";
import team from "../data/team.js";
import pokemonApi from "../data/pokeapi.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    let isLoggedIn = req.session.user ? true : false;
    res.render("landingPage", { isLoggedIn: isLoggedIn, title: "Welcome" });
  } catch (e) {
    res.status(500).send(e.message);
  }
});

router
  .route("/register")
  .get((req, res) => {
    res.render("signUpForm", { title: "Register" });
  })
  .post(async (req, res) => {
    let user = req.body;
    try {
      user.username = data_validation.validateUsername(
        xss(user.username),
        "username"
      );
      user.password = data_validation.validatePassword(
        xss(user.password),
        "password"
      );
      user.email = data_validation.validateEmail(xss(user.email), "email");
      user.dob = data_validation.validateDate(xss(user.dob), "dob");
    } catch (e) {
      res.status(400).render("signUpForm", { error: e, title: "Register" });
    }
    try {
      const newUser = await dbData.users.createNewUser(
        user.username,
        user.password,
        user.email,
        user.dob
      );
      res.redirect("/login");
    } catch (e) {
      res.status(400).render("signUpForm", { error: e, title: "Register" });
    }
  });

router.route("/user/:name").get(async (req, res) => {
  let session_user = req.session.user;
  let route_user;
  try {
    route_user = await dbData.users.getUserByName(req.params.name);
  } catch (e) {
    res.status(404).render("userError", { layout: "userProfiles", error: e });
  }

  let teamData = [];
  for(let teamId of route_user.teams) {
    let selectTeam = await team.getTeam(teamId._id);
    let teamDraft = await getDraft(selectTeam.draft_id);
    let draft_master = await users.getUserById(teamDraft.draft_master);

    let imageList = [];
    
    for (const pokemon of selectTeam.selections){
      let image = await pokemonApi.getPokemon(pokemon.name);
      image = image.sprites.front_default;
      imageList.push(image);
    }



    let teamObject = {
        draft_master: draft_master.username,
        selections: selectTeam.selections,
        wins: selectTeam.wins,
        losses: selectTeam.losses,
        teamSize: selectTeam.selections.length,
        images: imageList,
        draft_id: selectTeam.draft_id
    }
    teamData.push(teamObject);
  }


  let isEmpty = teamData.length === 0;
  let vis = "";
  if(route_user.public) {
    vis = "Public";
  } else {
    vis = "Private";
  }

  if (session_user.username === route_user.username) {
    let inviteNames = [];
    for(let invite of route_user.invites) {
        let grabDraft = await getDraft(invite);
        let user = await users.getUserById(grabDraft.draft_master);
        let draftInfo = {
            draftId: invite,
            username: user.username
        }
        inviteNames.push(draftInfo);
    }
    res.render("userhome", {
      layout: "userProfiles",
      newUser: route_user.username,
      isEmpty: isEmpty,
      userTeams: teamData,
      invites: inviteNames,
      visibility: vis,
    });
  } else {
    if (!route_user.public) {
      teamData = null;
      isEmpty = true;
    }
    res.render("userProfile", {
      layout: "userProfiles",
      newUser: route_user.username,
      isPublic: route_user.public,
      isEmpty: isEmpty,
      userTeams: teamData,
    });
  }
});

router
  .route("/login")
  .get((req, res) => {
    res.render("userlogon", { title: "Login" });
  })
  .post(async (req, res) => {
    const { username, password } = req.body;
    try {
      const user = await dbData.users.loginUser(xss(username), xss(password));
      req.session.user = user;
      // console.log(req.session.user);

      res.redirect("/user/" + user.username);
    } catch (e) {
      res.status(400).render("userlogon", { error: e, title: "Login" });
      return;
    }
  });

router.route("/logout").get((req, res) => {
  req.session.destroy();
  res.redirect("/");
});

router.route("/visibility").post(async (req, res) => {
    let user = req.body;
    try {
        user.username = data_validation.validateString(req.session.user.username);
        user.visibility = data_validation.validateString(xss(user.visibility));
        if(user.visibility != "public" && user.visibility != "private") throw "Profile visibility must be set to either public or private";
        await users.updateVisibility(user.username, user.visibility);
        res.redirect(`/user/${user.username}`);
    } catch (e) {
        res.status(404).render("userError", { layout: "userProfiles", error: e });
    }
})

export default router;
