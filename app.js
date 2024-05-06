//Here is where you'll set up your server as shown in lecture code
import express from "express";
import expressWs from "express-ws";
const app = expressWs(express()).app;
import exphbs from "express-handlebars";
import configRoutes from "./routes/index.js";
import session from "express-session";
import { dbConnection, closeConnection } from "./config/mongoConnection.js";
import dotenv from 'dotenv';
import { initWebsockets } from "./ws-app.js";

dotenv.config();

// const db = await dbConnection();

process.on("unhandledRejection", (reason, promise) => {
  console.log("Unhandled Rejection at:", promise, "reason:", reason);
});

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
  if (req.session && req.session.user) {
    if (req.method === "GET") {
      if (req.path === "/") {
        return res.redirect("/user/" + req.session.user.username);
      }
      return next();
    }
    return next();
  } else {
    return res.redirect("/login");
  }
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
  if (req.session.user.inDraft) {
    return res.redirect(`/draft/${inDraft}`);
  }
  next();
});

app.use("/tournament", async (req, res, next)=>{
  if(!req.session || !req.session.user){
    return res.redirect("/login");
  }
  next();
});


const rewriteUnsupportedBrowserMethods = (req, res, next) => {
  if (req.query && req.query._method) {
    req.method = req.query._method;
    delete req.query._method;
  }
  next();
};

const staticDir = express.static("public");
app.use("/public", staticDir);

app.use(express.json());
app.engine("handlebars", exphbs.engine({ defaultLayout: "main" }));
app.set("view engine", "handlebars");
app.use(express.urlencoded({ extended: true }));
app.use(rewriteUnsupportedBrowserMethods);

// app.ws("/init-ws", async (ws, res) => {
//   console.log("hi")
//   ws.on("open", function open() {
//     console.log(ws);
//   });
// });
initWebsockets(app);

configRoutes(app);

app.listen(3000, () => {
  console.log("We've now got a server!");
  console.log("Your routes will be running on http://localhost:3000");
});
