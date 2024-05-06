import data_validation from "../data/data_validation.js";
import express from "express";
import xss from "xss";
import tournaments from "../data/tournaments.js";

const router = express.Router();

router
  .get("/:id", async (req, res) => {
    try {
      let tournament = await tournaments.getTournament(req.params.id);
      res.render("tournamentDisplay", { layout: "userProfiles", title: "Tournament Page", tournament:tournament});
    } catch (e) {
      res.status(500).send(e.message);
    }
  })
  .post("/:id", async (req, res) => {
    if (!req.body)
      return res
        .status(400)
        .send("Need to provide information to create draft");
    let body = req.body;
    try {
      body.team1 = data_validation.validateString(xss(body.team1), "Team 1");
      body.team2 = data_validation.validateString(xss(body.team2), "Team 2");
      body.winner = data_validation.validateNumber(xss(body.winner), "Winner");
      let tournament = await tournaments.getTournament(req.params.id); // check if req.params.id is tournamentID

      if (
        !tournament.user_ids.include(body.team1) ||
        !tournament.user_ids.include(body.team2)
      )
        throw "A team in the match is not in the tournament";
      let schedule = tournament.schedule;
      for (let match of schedule) {
        if (match.team_1 === body.team1 && match.team_2 === body.team2) {
          match.winner = winner;
        }
      }
      throw "Match between two teams is not in tournament";
    } catch (e) {
      return res.status(400).render("tournamentDisplay", { error: e });
    }
  });

export default router;
