import express from "express";
import users from './user.js';
import draft from './draft.js';
import tournaments from './tournaments.js';
const constructorMethod = (app) => {
  app.use('/', users);
  app.use('/draft', draft);
  app.use('/draft/:id/ws', express.Router().get("/", async(req, res) => {
    res.render("ws-test")
  }))
  app.use('/tournament', tournaments);
  app.use('*', (req, res) => {
    return res.status(404).render("userError", {layout: 'userProfiles', title: 'Error', notFound: true});
  });
};

export default constructorMethod;
