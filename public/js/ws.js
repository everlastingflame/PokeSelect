const ws = new WebSocket(
  "ws://" + window.location.hostname + ":3000/6635cfd789f468fc9ee37d09/init-ws"
);

ws.addEventListener("open", () => {
  ws.send(
    JSON.stringify({
      type: "update",
      data: "my choice",
    })
  );
});

ws.onmessage = (event) => {
  let msg = JSON.parse(event.data);
  if (msg.type === "error") {
    alert(msg.data);
  } else {
    console.log(msg.data);
  }
};
