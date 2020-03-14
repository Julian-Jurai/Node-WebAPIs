var cp = require("child_process");
var http = require("http");
var filename = process.argv[2];

if (filename) {
  console.log("filename:", filename);
  var tail = cp.spawn("tail", ["-f", filename]);
  console.log("start tailing");

  tail.addListener("output", function(data) {
    console.log(data);
  });

  http
    .createServer(function(req, res) {
      res.writeHead(200, { "Content-Type": "text/plain" });
      tail.addListener("output", function(data) {
        res.sendBody("data");
      });
      res.end("okay");
    })
    .listen(8000);
}
