import data_validation from "../data/data_validation.js"
import express from 'express';
import { dbData } from "../data/index.js"
import { createNewDraft, editPokemonList, inviteUserToDraft, getDraft } from "../data/draft.js";
import pokemonApi from "../data/pokeapi.js";
import xss from "xss";
import {drafts} from "../config/mongoCollections.js";

const router = express.Router();

router.get('/new', async (req, res) => {
    try {
        res.render('userhome');
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
            if(body.tera_num_captains < 0) throw "Number of tera captains must be 0 or a positive number";
            if(body.tera_num_captains > body.team_size) throw "Number of tera captains must be less than or equal to the team size";
        }
    } catch (e) {
        return res.status(400).render("userhome", {error: e});
    }

    try {
        let draft = await createNewDraft(body.generation, body.draft_master, body.point_budget, body.team_size, body.tera_num_captains);
        res.redirect(`/draft/${draft._id.toString()}/settings`);
    } catch (e) {
        return res.status(404).render("userhome", {error: e});
    }
});

router.get("/:id/invite", async (req, res) => {
    try {
        res.render("inviteUsers");
    } catch (e) {
        res.status(500).send(e.message);
    }
}).post("/:id/invite", async (req, res) => {
    try {
        res.redirect(`/draft/${req.params.id}`);
    } catch (e) {
        res.status(500).render("inviteUsers", {error: e});
    }
})


router.post("/:id/inviteuser", async (req, res) => {
    if(!req.body) return res.status(400).send("Need to invite a player to the draft");
    let body = req.body;
    try {
        body.invites = data_validation.validateString(xss(body.invites), "invite");
    } catch (e) {
        return res.status(400).render("inviteUsers", {error: e});
    }

    try {
        await inviteUserToDraft(req.params.id, body.invites);
        res.status(200).redirect(`/draft/${req.params.id}/invite`);
    } catch (e) {
        return res.status(404).render("inviteUsers", {error: e});
    }
})



router.get("/:id/settings", async (req, res) => {
    try {
        let draftDetails = await getDraft(req.params.id);
        let pokemonList = draftDetails.pkmn_list;
        let isTera = false;
        if(draftDetails.gen_num === 9) {
            isTera = true;
        }

        let pokeObject = [];

        for (const pokemon of pokemonList) {
            let image = await pokemonApi.getPokemon(pokemon.name);
            pokeObject.push({
            name: pokemon.name,
            image: image.sprites.front_default
            });
        }
        console.log(pokeObject);

        res.render("draftBoard", {layout: 'userProfiles', pokeObject: pokeObject});
    } catch (e) {
        res.status(500).render("draftBoard", {layout: 'userProfiles', error: e});
    }
}).post("/:id/settings", async (req, res) => {
    if(!req.body) return res.status(400).send("Need to invite a player to the draft");
    let body = req.body;
    try {
        let draft = await getDraft(req.params.id);
        let pokemonBanned = data_validation.validateString(xss(body.pokemonBanned));
        let pkmnBannedArray = pokemonBanned.split(",");
        pkmnBannedArray = pkmnBannedArray.map((e) => data_validation.validateString(e, "banned Pokemon"));

        let teraBannedArray = [];

        if (draft.gen_num === 9) {
            let teraBanned = data_validation.validateString(xss(body.teraBanned));
            teraBannedArray = teraBanned.split(",");
            teraBannedArray = teraBannedArray.map((e) => data_validation.validateString(e, "banned Pokemon"));
        }
        draft.pkmn_list = await editPokemonList(draft.pkmn_list, pkmnBannedArray, teraBannedArray);
        draft.tera_banlist = teraBannedArray;

        let draftCollection = await drafts();
        draftCollection.replaceOne({_id: draft._id}, draft);
        
        res.redirect(`/draft/${req.params.id}/invite`);
    } catch (e) {
        res.status(500).render("draftBoard", {layout: 'userProfiles', error: e});
    }
})

router.get("/:id", async (req, res) => {
    try {
        res.render("draftPhase");
    } catch (e) {
        res.status(500).render("draftBoard", {layout: 'userProfiles', error: e});
    }
}).post("/:id", async (req, res) => {
    try {
        res.redirect(`/draft/${req.params.id}/start`);
    } catch (e) {
        res.status(500).render("draftBoard", {layout: 'userProfiles', error: e});
    }
})

export default router;