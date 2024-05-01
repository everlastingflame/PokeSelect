//Here is where you'll set up your server as shown in lecture code
import express from "express";
const app = express();
import exphbs from "express-handlebars";
import configRoutes from "./routes/index.js";
import session from "express-session";
import { dbConnection, closeConnection } from "./config/mongoConnection.js";
import dotenv from 'dotenv';

dotenv.config();

// const db = await dbConnection();

app.use(
  session({
    name: "AuthenticationState",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

app.use("/login", async (req, res, next) => {
  if (req.method === "GET") {
    if (req.session && req.session.user) {
      return res.redirect("/user/" + req.session.user.username);
    } else {
      app.get("/login");
    }
  }
  next();
});

app.use("/register", async (req, res, next) => {
  if (req.method === "GET") {
    if (req.session && req.session.user) {
      return res.redirect("/user/" + req.session.user.username);
    } else {
      app.get("/register");
    }
  }
  next();
});

app.use("/user", async (req, res, next) => {
  if (req.method === "GET") {
    if (req.session && req.session.user) {
      if (req.path === "/") {
        return res.redirect("/user/" + req.session.user.username);
      }
      return next();
    } else {
      return res.redirect("/login");
    }
  }
  next();
});

app.use("/logout", async (req, res, next) => {
  if (req.method === "GET") {
    if (req.session && req.session.user) {
      return next();
    } else {
      return res.redirect("/login");
    }
  }
  next();
});

app.use("/draft", async (req, res, next) => {
  if (!req.session || !req.session.user) {
    return res.redirect("/login");
  }
  next();
})

const rewriteUnsupportedBrowserMethods = (req, res, next) => {
  if (req.body && req.body._method) {
    req.method = req.body._method;
    delete req.body._method;
  }
  next();
};

const staticDir = express.static("public");
app.use("/public", staticDir);

app.use(express.json());
app.engine("handlebars", exphbs.engine({ defaultLayout: "main" }));
app.set("view engine", "handlebars");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(rewriteUnsupportedBrowserMethods);

configRoutes(app);

app.listen(3000, () => {
  console.log("We've now got a server!");
  console.log("Your routes will be running on http://localhost:3000");
});
