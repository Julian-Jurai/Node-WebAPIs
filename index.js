var cp = require("child_process");
var http = require("http");
var filename = process.argv[2];

if (filename) {
  console.log("filename:", filename);
  var tail = cp.spawn("tail", ["-f", filename]);

  var body = "";
  tail.stdout.on("data", function(data) {
    body = data.toString();
    console.log("tail.stdout.on:", data.toString());
  });

  http
    .createServer(function(req, res) {
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.write(body);
      res.end();
    })
    .listen(8000);
}
