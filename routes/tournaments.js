import data_validation from "../data/data_validation.js";
import express from "express";
import xss from "xss";
import tournaments from "../data/tournaments.js";
import users from "../data/users.js";
import teams from "../data/team.js";

const router = express.Router();

router
  .get("/:id", async (req, res) => {
    try {
      let tournamentObj = await tournaments.getTournament(req.params.id);
      let schedule = []
      for (let match of tournamentObj.schedule) {
        let team1 = await teams.getTeam(match.team_1);
        let user1 = await users.getUserById(team1.user_id.toString());
        let team2 = await teams.getTeam(match.team_2);
        let user2 = await users.getUserById(team2.user_id.toString());
        let winnerUser = "";
        if(typeof match.winner === "number") {
          if(match.winner === 0) winnerUser = "TBD";
          if(match.winner === 1) winnerUser = `${user1.username}`;
          if(match.winner === 2) winnerUser = `${user2.username}`;
        }
        let matchup = {
          user1: user1.username,
          user2: user2.username,
          winner: winnerUser
        }
        schedule.push(matchup);
      }
      return res.render("tournamentResults", { layout: "userProfiles", title: "Tournament Page", schedule:schedule});
    } catch (e) {
      res.status(500).render("userError", {layout: "userProfiles", title: "Error"})
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
      return res.status(404).render("tournamentDisplay", { error: e });
    }
  });

export default router;
