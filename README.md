# Server-Client Communction

This project is a demonstration of using various means of communicating with a simple http server

## Getting Started

1. `npm install`
2. `npm start`
3. open [localhost:8000](http://localhost:8000/)

## Playground Demo

![demo](demo4.gif)

### AJAX polling demo

Clicking _Start Ajax_ creates an loop that continuously fetches information from the server. To demonstarte the changes being updated, make a change to the `test.txt` file to see it reflected in the client.

| Client |
| ------ |


```js
var i = setInterval(() => {
  fetch("/ajax")
    .then(response => {
      return response.text();
    })
    .then(data => {
      document.getElementById("ajax-messages").innerText = data;
    })
    .catch(() => {
      console.log("Stopping, server disconnected");
      clearInterval(i);
    });
}
```

| Server |
| ------ |


```js
const server = http
  .createServer(function(req, res) {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.write(fileContents);
    res.end();
  })
  .listen(8000);
```

### Websocket demo

Clicking _Start Websocket_ opens a connection to the http server and enables a text input which pushes messages to the server. Messages sent to server appear in green and messages recieved from appear in red.

| Client |
| ------ |


```js
const ws = new WebSocket("ws://localhost:8000/");

ws.onopen = function() {
  console.log("WebSocket Client Connected");
  ws.send("Client Connected");
};
ws.onclose = function() {
  console.log("WebSocket Client Disconnected");
};

ws.onmessage = e => {
  console.log("Received: '" + e.data + "'");
};
```

| Server |
| ------ |


```js
const server = http.createServer(function (req, res) {
  res.writeHead(200, {"Content-Type": "text/plain"});
  res.write(fileContents);
  res.end()
}).listen(8000);;

const websocketServer = new WebSocketServer({ httpServer: http.createServer().listen(8000) });

websocketServer.on("request", function (request) {
  const connection = request.accept(null, request.origin);

  connection.on("message", function (message) {
    console.log("Received Message:", message.utf8Data);
    connection.sendUTF(`Server Received: ${message.utf8Data}`);
  });

  connection.on("close", function (_reasonCode, _description) {
    console.log("Client disconnected.");
  });
}

```

### Server Sent Events demo

Clicking _Start Server Events_ establishes a long lived connection to the server and updates at an interval to reflect the number of active server connections (turn websockets off to see a change).

| Client |
| ------ |


```js
var source = new EventSource("http://localhost:8000/sse");

source.addEventListener("message", function(e) {
  console.log("Received: '" + e.data + "'");
});

source.addEventListener("open", function(e) {
  console.log("SSE Connection Connected");
});
source.addEventListener("close", function(e) {
  console.log("SSE Connection Disconnected");
});
```

| Server |
| ------ |


```js
const server = http
  .createServer(function(req, res) {
    if (req.url === "sse") {
      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive"
      });
      res.write("event: message\n");
      res.write("data: Foo Bar\n\n");
      res.end();
    }
  })
  .listen(8000);
```
