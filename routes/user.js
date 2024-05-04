import data_validation from "../data/data_validation.js";
import express from "express";
import { dbData } from "../data/index.js";
import xss from "xss";

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
      res.redirect("/login", { title: "Login" });
    } catch (e) {
      res.status(400).render("signUpForm", { error: e, title: "Register" });
    }
  });

router.route("/user/:name").get(async (req, res) => {
  let user = req.session.user;
  try {
    let profile_user = await dbData.users.getUserByName(req.params.name);

    let teamData = profile_user.teams;

    if (profile_user.teams.length === 0) {
      teamData = `${profile_user.username} has no teams.`;
    }

    if (user.username === profile_user.username) {
      teamData = "You have no teams";
      res.render("userhome", {
        layout: "userProfiles",
        newUser: profile_user.username,
        userTeams: teamData,
      });
    } else {
      res.render("userProfile", {
        layout: "userProfiles",
        newUser: profile_user.username,
        userTeams: teamData,
      });
    }
  } catch (e) {
    res.status(404).render("userError", { layout: "userProfiles", error: e });
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

export default router;
