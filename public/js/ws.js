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
    let round = msg.state.round_no;

    let next_username = msg.state.next_user;


    let point_tag = $(`#${user_id} p.points:first`);
    // let point_tag = div.children('.points');
    point_tag.text(`Points Remaining: ${points}`);

    let img_tag = $(`#${name} img:first`);
    img_tag.removeClass('popup-tooltip');
    let img_div = $(`#${name}`).detach();

    let slots = $(`#${user_id} > .pokemon-selections-grid`);
    slots = $(`#${user_id} > .pokemon-selections-grid > div.pokemon-slot`);
    let slot = $(`#${user_id} .pokemon-selections-grid > div.pokemon-slot:nth-child(${round})`);
    let output = img_tag.appendTo(slot);
    $(`#${name} > .pokemon-selections-grid > div.pokemon-slot:nth-child(${round-1})`).append($(`#${name} img:first`));

    $('#next-username').text(next_username);
    $('#pick-num').text(pick+1);
    $('#round-num').text(round);

  } else if (msg.type === "end") {
    location.reload();
  } else {
    console.log(`Unknown message type ${msg.type}.`);
  }
}

(function() {
  let form = document.getElementById('draftChoice');
  form.addEventListener('submit', function(event) {
    event.preventDefault();
    $('#error_container').addClass('d-none');
    let name = event.submitter.value;
    sendUpdate({type: "update", name: name});
  });

  // $("#draftChoice").on('submit', function (event) {
  //   event.preventDefault();
  //   console.log(event.submitter.value);
  // })
})()