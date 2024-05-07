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
        let draft = await getDraft(draft_id);

        let user_id = req.session.user.id;
        let pick_index = draft.pick_number % draft.team_ids.length;
        let next_pick = draft.user_ids[pick_index].toString();
        if (user_id !== next_pick) {
          return sendError(ws, "It is not your turn to pick!");
        }

        let team_id = draft.team_ids[draft.pick_number % draft.team_ids.length];
        try {
          await draftPokemonToTeam(user_id, team_id, msg.name, draft_id);
        } catch (e) {
          return sendError(ws, e);
        }
        // Push update info to all connected clients in the draft
        draft = await getDraft(draft_id);
        let next_user = await dbData.users.getUserById(draft.user_ids[(pick_index+1) % draft.team_ids.length]);
        let team = await dbData.team.getTeam(team_id);
        pushUpdates(draft_id, {
          user: user_id,
          next_user: next_user.username,
          team: team_id,
          name: msg.name,
          points_left: team.points_remaining,
          pick_no: draft.pick_number,
          // TODO: round number from draft object
          slot_no: Math.ceil((draft.pick_number) / draft.team_ids.length),
          round_no: Math.ceil((draft.pick_number+1) / draft.team_ids.length),
        });
        if(draft.pick_number >= (draft.team_size * draft.team_ids.length)) {
          pushUpdates(draft_id, {}, "end");
        }
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

function pushUpdates(draft_id, data, type = "newState") {
  for (const ws of draft_groups[draft_id]) {
    ws.send(JSON.stringify({ type: type, state: data }));
  }
}

export { initWebsockets };
