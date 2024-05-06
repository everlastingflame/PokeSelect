import { getDraft, draftPokemonToTeam } from "./data/draft.js";
import { dbData } from "./data/index.js";

const draft_groups = {};

function initWebsockets(app) {
  app.ws("/draft/:id/ws", async (ws, req) => {
    const draft_id = req.params.id;
    if (!draft_groups[draft_id]) {
      draft_groups[draft_id] = [ws];
    } else {
      draft_groups[draft_id].push(ws);
    }

    ws.on("message", async function (msg) {
      msg = JSON.parse(msg);
      if (msg.type === "update") {
        let user_id = req.session.user ? req.session.user.id : "no id";
        let draft = await getDraft(draft_id);

        let next_pick = draft.user_ids[draft.pick_number].toString();
        if (user_id !== next_pick) {
          return sendError(ws, "It is not your turn to pick!");
        }
        
        let team_id = draft.team_ids[draft.pick_number];
        try {
          await draftPokemonToTeam(user_id, team_id, msg.name, draft_id);
        } catch (e) {
          console.log(e)
          return sendError(ws, e);
        }
        // Push update info to all connected clients in the draft
        draft = await getDraft(draft_id);
        pushUpdates(draft_id, draft);
      } else {
        console.error(`Unimplemented message type: ${msg.type}`);
      }
    });

    ws.on("close", function () {
      draft_groups[draft_id] = draft_groups[draft_id].filter((e) => e != ws);
    });
  });
}

async function processUpdate(draft, user, msg) {}

function sendError(ws, error_msg) {
  return ws.send(JSON.stringify({ type: "error", data: error_msg }));
}

function pushUpdates(draft_id, data) {
  for (const ws of draft_groups[draft_id]) {
    ws.send(JSON.stringify({type: "newState", state: data}));
  }
}

export { initWebsockets };
