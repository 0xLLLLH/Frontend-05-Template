import * as http from "http";
import * as fs from "fs";

http
  .createServer((req, res) => {
    fs.readFile(__dirname + "/test.html", function (err, data) {
      if (err) {
        console.log(err);
      }
      res.writeHead(200, {
        "Content-Type": "text/html",
        "Content-Length": data.length,
        "Transfer-Encoding": "chunked",
      });
      res.write(data);
      res.end();
    });
  })
  .listen(8088);

console.log("server started");
