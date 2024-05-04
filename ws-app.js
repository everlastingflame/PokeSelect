import { getDraft } from "./data/draft.js";

const draft_groups = {};

function initWebsockets(app) {
  app.ws("/draft/:id/ws", async (ws, req) => {
    const draft_id = req.params.id
    if (!draft_groups[draft_id]) {
      draft_groups[draft_id] = [ws]
    } else {
      draft_groups[draft_id].push(ws);
    }

    ws.on('message', async function(msg) {
      msg = JSON.parse(msg);
      if (msg.type === "update") {
        let user_id = req.session.user ? req.session.user.id : "no id";
        let draft = await getDraft(draft_id);

        if (user_id !== draft.user_ids[draft.pick_number]) {
          return ws.send(JSON.stringify({type: "error", data: "error message!"}));
        }
        // TODO: Update draft object
        // Push update info to all connected clients in the draft
        pushUpdates(draft_id, msg.data);
      }
    });

    ws.on('close', function() {
      draft_groups[draft_id] = draft_groups[draft_id].filter((e) => e != ws);
    })
  });
}

function pushUpdates(draft_id, data) {
  for (const ws of draft_groups[draft_id]) {
    ws.send(data);
  }
}

export { initWebsockets };
