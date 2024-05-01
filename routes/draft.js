import data_validation from "../data/data_validation.js"
import express from 'express';
import { dbData } from "../data/index.js"
import { createNewDraft } from "../data/draft.js";
import xss from "xss";

const router = express.Router();

router.get('/new', async (req, res) => {
    try {
        res.render('newDraft');
    } catch (e) {
        res.status(500).send(e.message);
    }
})
.post("/new", async (req, res) => {
    if(!req.body) return res.status(400).send("Need to provide information to create draft");
    let body = req.body;
    try {
        body.generation = data_validation.validateString(xss(body.generation), "generation");
        body.generation = body.generation.slice(-1);
        body.draft_master = data_validation.validateString(req.session.user.username, "draft_master");
        body.point_budget = data_validation.validateNumber(parseInt(xss(body.pointBudget)), "point_budget");
        body.team_size = data_validation.validateNumber(parseInt(xss(body.teamSize)), "team_size");
        if (body.generation === "9") {
            body.tera_num_captains = data_validation.validateNumber(parseInt(xss(body.teraCaptain)), "teraCaptain");
            if(body.tera_num_captains < 0 || body.tera_num_captains > body.team_size) throw "Number of tera captains must be 0 or a positive number";
        }
    } catch (e) {
        return res.status(400).render("newDraft", {error: e});
    }

    try {
        let draft = await createNewDraft(body.generation, body.draft_master, body.point_budget, body.team_size, body.tera_num_captains);
        console.log("hey there")
        res.redirect(`/draft/${draft._id.toString()}/invite`)
    } catch (e) {
        return res.status(404).send(e.message);
    }
});

router.get("/:id/invite", async (req, res) => {
    try {
        res.render("inviteUsers");
    } catch (e) {
        res.status(500).send(e.message);
    }
})

export default router;