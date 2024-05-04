const ws = new WebSocket(
  "ws://" + window.location.host + window.location.pathname
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
