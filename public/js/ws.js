const ws = new WebSocket(
  "ws://" + window.location.host + window.location.pathname + "/ws"
);

// ws.addEventListener("open", () => {
//   sendUpdate(
//     JSON.stringify({
//       type: "update",
//       name: "blastoise",
//       points: 57,
//     })
//   );
// });

ws.onmessage = parseMsg;

function sendUpdate(selection) {
  ws.send(JSON.stringify(selection));
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
    let user_id = msg.state.user;
    let team_id = msg.state.team;
    let name = msg.state.name;
    let points = msg.state.points_left;
    let pick = msg.state.pick_no;

    let next_username = msg.state.next_user;


    let div = $(`#${user_id}`);
    let point_tag = div.children('.points');
    point_tag[0].innerText = `Points Remaining: ${points}`;

  } else {
    console.log(`Unknown message type ${msg.type}.`);
  }
}

(function() {
  let form = document.getElementById('draftChoice');
  form.addEventListener('submit', function(event) {
    event.preventDefault();
    let name = event.submitter.value;
    sendUpdate({type: "update", name: name});
  });

  // $("#draftChoice").on('submit', function (event) {
  //   event.preventDefault();
  //   console.log(event.submitter.value);
  // })
})()