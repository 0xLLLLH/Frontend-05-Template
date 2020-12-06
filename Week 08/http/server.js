"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http = require("http");
http
    .createServer((req, res) => {
    let body = [];
    req
        .on("error", (err) => {
        console.log(err);
    })
        .on("data", (chunk) => {
        body.push(chunk);
    })
        .on("end", () => {
        let bodyString = Buffer.concat(body).toString();
        console.log("body:", bodyString);
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(" Hello World\n");
    });
})
    .listen(8088);
console.log("server started");
