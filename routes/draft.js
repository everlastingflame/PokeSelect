import data_validation from "../data/data_validation.js"
import express from 'express';
import { dbData } from "../data/index.js"
import { createNewDraft } from "../data/draft.js";

const router = express.Router();

router.get('/new', async (req, res) => {
    try {
        res.render('newDraft');
    } catch (e) {
        res.status(500).send(e.message);
    }
})
.post(async (req, res) => {
    try {
        if(!req.body) throw "Need to provide information to create draft";
        let body = req.body;
        body.generationName = data_validation.validateString(xss(body.generationName.value), "generationName");
        body.draft_master = data_validation.validateString(xss(body.draft_master.value), "draft_master");
        body.point_budget = data_validation.validateNumber(xss(body.point_budget.value), "point_budget");
        body.team_size = data_validation.validateNumber(xss(body.team_size.value), "team_size");
        body.tera_num_captains = data_validation.validateNumber(xss(body.tera_num_captains.value), "tera_num_captains");
    } catch (e) {
        res.status(400).send(e.message);
    }

    try {
        let draft = await createNewDraft(body.generationName, body.draft_master, body.point_budget, body.team_size, body.tera_num_captains);
        console.log("hey there")
        res.redirect(`/draft/${draft._id.toString()}/invite`)
    } catch (e) {
        res.status(404).send(e.message);
    }
});

router.get("/draft/:id/invite", async (req, res) => {
    try {
        res.render("inviteUsers");
    } catch (e) {
        res.status(500).send(e.message);
    }
})

export default router;