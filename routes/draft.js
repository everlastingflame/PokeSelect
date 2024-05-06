import data_validation from "../data/data_validation.js";
import express from "express";
import { dbData } from "../data/index.js";
import {
  createNewDraft,
  editPokemonValue,
  editPokemonList,
  inviteUserToDraft,
  getDraft,
  checkInviteForUser,
  deleteDraft,
} from "../data/draft.js";
import pokemonApi from "../data/pokeapi.js";
import xss from "xss";
import { drafts } from "../config/mongoCollections.js";

const router = express.Router();

router
  .get("/new", async (req, res) => {
    try {
      res.render("userhome");
    } catch (e) {
      res.status(500).send(e.message);
    }
  })
  .post("/new", async (req, res) => {
    if (!req.body)
      return res
        .status(400)
        .send("Need to provide information to create draft");
    let body = req.body;
    try {
      body.generation = data_validation.validateString(
        xss(body.generation),
        "generation"
      );
      body.generation = body.generation.slice(-1);
      body.draft_master = data_validation.validateString(
        req.session.user.username,
        "draft_master"
      );
      body.point_budget = data_validation.validateNumber(
        parseInt(xss(body.pointBudget)),
        "point_budget"
      );
      body.team_size = data_validation.validateNumber(
        parseInt(xss(body.teamSize)),
        "team_size"
      );
      if (body.generation === "9") {
        body.tera_num_captains = data_validation.validateNumber(
          parseInt(xss(body.teraCaptain)),
          "teraCaptain"
        );
        if (body.tera_num_captains < 0)
          throw "Number of tera captains must be 0 or a positive number";
        if (body.tera_num_captains > body.team_size)
          throw "Number of tera captains must be less than or equal to the team size";
      }
    } catch (e) {
      return res.status(400).render("userhome", { error: e });
    }

    try {
      let draft = await createNewDraft(
        body.generation,
        body.draft_master,
        body.point_budget,
        body.team_size,
        body.tera_num_captains
      );
      res.redirect(`/draft/${draft._id.toString()}/settings`);
    } catch (e) {
      return res.status(404).render("userhome", { error: e });
    }
  });

router
  .get("/:id/invite", async (req, res) => {
    try {
      res.render("inviteUsers", { layout: "userProfiles" });
    } catch (e) {
      res.status(500).send(e.message);
    }
  })
  .post("/:id/invite", async (req, res) => {
    if (!req.body)
      return res.status(400).send("Need to invite a player to the draft");
    let body = req.body;
    try {
      body.username = data_validation.validateString(
        xss(body.username),
        "invite"
      );
    } catch (e) {
      return res
        .status(400)
        .render("inviteUsers", { layout: "userProfiles", error: e });
    }

    try {
      await inviteUserToDraft(req.params.id, body.username);
      res.status(200).redirect(`/draft/${req.params.id}/invite`);
    } catch (e) {
      return res
        .status(404)
        .render("inviteUsers", { layout: "userProfiles", error: e });
    }
  });

router
  .get("/:id/settings", async (req, res) => {
    try {
      let draftDetails = await getDraft(req.params.id);
      let pokemonList = draftDetails.pkmn_list;
      let isTera = false;
      if (draftDetails.gen_num === 9) {
        isTera = true;
      }

      let pokeObject = [];

      for (const pokemon of pokemonList) {
        let image = await pokemonApi.getPokemon(pokemon.name);
        pokeObject.push({
          name: pokemon.name,
          image: image.sprites.front_default,
          isTera: isTera,
        });
      }

      res.render("draftBoard", {
        layout: "userProfiles",
        pokeObject: pokeObject,
        draftId: req.params.id,
      });
    } catch (e) {
      res
        .status(500)
        .render("draftBoard", { layout: "userProfiles", error: e });
    }
  })
  .post("/:id/settings", async (req, res) => {
    if (!req.body)
      return res.status(400).send("Need to invite a player to the draft");
    let body = req.body;
    try {
      let draft = await getDraft(req.params.id);
      let bannedPokemon = [];
      let teraBanned = [];

      for (let pokemon of body) {
        pokemon.name = data_validation.validateString(xss(pokemon.name));
        pokemon.pointValue = data_validation.validateString(
          xss(pokemon.pointValue)
        );
        if (parseInt(pokemon.pointValue) < 0)
          throw "Point values must be 0 or a positive number";
        if (parseInt(pokemon.pointValue) != 1) {
          editPokemonValue(
            draft.pkmn_list,
            pokemon.name,
            parseInt(pokemon.pointValue)
          );
        }
        if (typeof pokemon.isBanned != "boolean")
          throw "Pokemon ban must be a boolean value";
        if (pokemon.isBanned) {
          bannedPokemon.push(pokemon.name);
        }
        if (draft.gen_num === 9 && pokemon.isTeraBanned) {
          teraBanned.push(pokemon.name);
        }
      }

      draft.pkmn_list = await editPokemonList(
        req.params.id,
        draft.pkmn_list,
        bannedPokemon,
        teraBanned
      );
      draft.tera_banlist = teraBanned;

      let draftCollection = await drafts();
      draftCollection.replaceOne({ _id: draft._id }, draft);

      res.status(200).send({ redirect: `/draft/${req.params.id}/invite` });
      // res.redirect(`/draft/${req.params.id}/invite`);
    } catch (e) {
      res
        .status(500)
        .render("draftBoard", { layout: "userProfiles", error: e });
    }
  })
  .delete("/:id/settings", async (req, res) => {
    let draft_id = req.params.id;
    try {
      await deleteDraft(draft_id);
      res.redirect(`/user/`);
    } catch (e) {
      res
        .status(500)
        .render("draftBoard", { layout: "userProfiles", error: e });
    }
  });

router.post("/accept", async (req, res) => {
  let body = req.body;
  try {
    body.draftId = data_validation.validateId(body.draftId);
    await checkInviteForUser(body.draftId, req.session.user.id, true);
    res.redirect(`/draft/${body.draftId}`);
  } catch (e) {
    res.status(500).redirect(`/user/${req.session.user.username}`);
  }
});

router.post("/decline", async (req, res) => {
  let body = req.body;
  try {
    body.draftId = data_validation.validateId(body.draftId);
    await checkInviteForUser(body.draftId, req.session.user.id, false);
    res.redirect(`/${body.draftId}`);
  } catch (e) {
    res.status(500).redirect(`/user/${req.session.user.username}`);
  }
});

router
  .get("/:id", async (req, res) => {
    try {
      let draftObj = await getDraft(req.params.id);
      req.session.user.inDraft = true;
      let mainUser = req.session.user.id;
      draftObj.user_ids = draftObj.user_ids.filter(
        (userId) => !userId.equals(mainUser)
      );
      let mainUsername = req.session.user.username;
      let users = draftObj.user_ids;
      users.forEach(async (id) => await dbData.users.getUserById(id));
      users.forEach((e) => (e.id = e._id.toString()));
      let pokeObject = [];
      let pokemonList = draftObj.pkmn_list;

      for (const pokemon of pokemonList) {
        let image = await pokemonApi.getPokemon(pokemon.name);
        pokeObject.push({
          name: pokemon.name,
          image: image.sprites.front_default,
          pointVal: pokemon.point_val,
          stats: pokemon.stats,
          types: pokemon.types,
          abilities: pokemon.abilities,
        });
      }

      res.render("draftPhase", {
        layout: "draftLayout",
        draft: draftObj,
        main_id: mainUser,
        main_name: mainUsername,
        users: users,
        pokeObject: pokeObject,
      });
    } catch (e) {
      res
        .status(500)
        .render("draftBoard", { layout: "userProfiles", error: e });
    }
  })
  .post("/:id", async (req, res) => {
    try {
      res.redirect(`/draft/${req.params.id}/start`);
    } catch (e) {
      res
        .status(500)
        .render("draftBoard", { layout: "userProfiles", error: e });
    }
  });

export default router;
