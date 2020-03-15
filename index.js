var cp = require("child_process");
var http = require("http");
var fs = require("fs");
var filename = process.argv[2];

if (filename) {
  console.log("filename:", filename);
  var tail = cp.spawn("tail", ["-f", filename]);

  var tailData = "";
  tail.stdout.on("data", function(data) {
    tailData = data.toString();
    console.log("tail.stdout.on:", data.toString());
  });

  http
    .createServer(function(req, res) {
      switch (req.url) {
        case "/":
          fs.readFile("index.html", function(err, html) {
            res.writeHead(200, { "Content-Type": "text/html" });
            res.write(html);
            res.end();
          });
          break;
        case "/watch":
          res.writeHead(200, { "Content-Type": "text/plain" });
          res.write(tailData);
          res.end();
          break;
        default:
          console.log("Sorry no route matches", req.url);
      }
    })
    .listen(8000);
}
