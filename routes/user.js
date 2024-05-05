import data_validation from "../data/data_validation.js";
import express from "express";
import { dbData } from "../data/index.js";
import xss from "xss";
import users from "../data/users.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    let isLoggedIn = req.session.user ? true : false;
    res.render("landingPage", { isLoggedIn: isLoggedIn, title: "Welcome" });
  } catch (e) {
    res.status(500).send(e.message);
  }
});

router.get("/users", async (req, res) => {
  try {
    const users = await dbData.users.getAll();
    res.json(users);
  } catch (e) {
    res.status(500).send(e.message);
  }
});

router.get("/users/:id", async (req, res) => {
  try {
    const user = await dbData.users.getUser(req.params.id);
    if (!user) {
      res.status(404).send("User not found");
      return;
    }
    res.json(user);
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

  let teamData = route_user.teams;
  let isEmpty = teamData.length === 0;
  let vis = "";
  if(route_user.public) {
    vis = "Public";
  } else {
    vis = "Private";
  }

  if (session_user.username === route_user.username) {
    res.render("userhome", {
      layout: "userProfiles",
      newUser: route_user.username,
      isEmpty: isEmpty,
      userTeams: teamData,
      invites: route_user.invites,
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

      req.session.user.inDraft = false;
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
