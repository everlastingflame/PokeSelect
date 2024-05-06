const ws = new WebSocket(
  "ws://" + window.location.host + window.location.pathname + "/ws"
);

ws.addEventListener("open", () => {
  sendUpdate(
    JSON.stringify({
      type: "update",
      name: "blastoise",
      points: 57,
    })
  );
});

ws.onmessage = parseMsg;

function sendUpdate(selection) {
  ws.send(selection);
}

function parseMsg(msg) {
  msg = JSON.parse(msg.data);
  if (msg.type === "error") {
    $("#error_container").html(msg.data).removeClass("d-none");
  } else if (msg.type === "newState") {
    // Process draft update
    // 1. Remove/gray-out pokemon from list (pokemon name as div's id?)
    // 2. Add selected pokemon to appropriate team roster
    // 3. Update points value for team
    console.log(msg.state)
  } else {
    console.log(`Unknown message type ${msg.type}.`);
  }
}
