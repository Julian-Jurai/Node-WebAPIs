var cp = require("child_process");
var http = require("http");
var fs = require("fs");
var WebSocketServer = require("websocket").server;
var filename = process.argv[2];
var sseCount = 0;
var connectionCount = 0;

if (filename) {
  console.log("tail -f", filename);
  var tail = cp.spawn("tail", ["-f", filename]);

  var fileContents = "";
  tail.stdout.on("data", function(data) {
    fileContents = data.toString();
    console.log(fileContents);
  });

  const server = http
    .createServer(function(req, res) {
      switch (req.url) {
        case "/":
          fs.readFile("index.html", function(err, html) {
            res.writeHead(200, { "Content-Type": "text/html" });
            res.write(html);
            res.end();
          });
          break;
        case "/ajax":
          res.writeHead(200, { "Content-Type": "text/plain" });
          res.write(fileContents);
          res.end();
          break;
        case "/sse":
          res.writeHead(200, {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive"
          });
          res.write("event: message\n");
          if (sseCount === 0) {
            sseCount += 1;
            res.write("data: Initial SSE Event\n\n");
          } else {
            res.write(`data: Server Connections ${connectionCount}\n\n`);
          }
          res.end();
          break;
        default:
          console.log("Sorry no route matches", req.url);
      }
    })
    .listen(8000);

  setInterval(function() {
    server.getConnections(function(_err, count) {
      connectionCount = count;
    });
  }, 1000);

  const websocketServer = new WebSocketServer({ httpServer: server });
  websocketServer.on("request", function(request) {
    const connection = request.accept(null, request.origin);

    connection.on("message", function(message) {
      console.log("Received Message:", message.utf8Data);
      connection.sendUTF(`Server Received: ${message.utf8Data}`);
    });

    function handleFileChange(eventType) {
      if (eventType === "change") {
        connection.sendUTF(`File changed:\n ${fileContents}`);
      }
    }

    fs.watch(filename, handleFileChange.bind(this));

    connection.on("close", function(_reasonCode, _description) {
      console.log("Client disconnected.");
    });
  });
} else {
  throw new Error(
    'Argument Error. \n Argument "filename missing"\n Example: npm start test.txt '
  );
}
