"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const net = require("net");
const HTMLParser_1 = require("./HTMLParser");
const ResponseParser_1 = require("./ResponseParser");
require("./json.js");
const images = require("images");
const render_1 = require("./render");
const path = require("path");
const HeaderKey = {
    CONTENT_TYPE: "Content-Type",
    CONTENT_LENGTH: "Content-Length",
};
const ContentTypeString = {
    formUrlencoded: "application/x-www-form-urlencoded",
    json: "application/json",
};
class Request {
    constructor(config) {
        this.method = config.method || "GET";
        this.host = config.host;
        this.port = config.port || 80;
        this.path = config.path || "/";
        this.body = config.body || {};
        this.headers = config.headers || {};
        if (!this.headers[HeaderKey.CONTENT_TYPE]) {
            this.headers[HeaderKey.CONTENT_TYPE] = ContentTypeString.formUrlencoded;
        }
        if (this.headers[HeaderKey.CONTENT_TYPE] === ContentTypeString.formUrlencoded) {
            this.bodyText = Object.keys(this.body)
                .map((key) => `${key}=${encodeURIComponent(this.body[key])}`)
                .join("&");
        }
        else if (this.headers[HeaderKey.CONTENT_TYPE] === ContentTypeString.json) {
            this.bodyText = JSON.stringify(this.body);
        }
        this.headers[HeaderKey.CONTENT_LENGTH] = this.bodyText.length;
    }
    send(connection) {
        return new Promise((resolve, reject) => {
            const parser = new ResponseParser_1.default();
            if (connection) {
                connection.write(this.toString());
            }
            else {
                connection = net.createConnection({
                    host: this.host,
                    port: this.port,
                }, () => {
                    connection.write(this.toString());
                });
                connection.on("data", (data) => {
                    console.log(data.toString());
                    parser.receive(data.toString());
                    if (parser.isFinished) {
                        resolve(parser.response);
                        connection.end();
                    }
                });
                connection.on("error", (err) => {
                    reject(err);
                    connection.end();
                });
            }
        });
    }
    toString() {
        return `${this.method} ${this.path} HTTP/1.1\r\n${Object.keys(this.headers)
            .map((key) => `${key}: ${this.headers[key]}`)
            .join("\r\n")}\r\n\r\n${this.bodyText}`;
    }
}
async function main() {
    let request = new Request({
        method: "POST",
        host: "127.0.0.1",
        port: 8088,
        path: "/",
        headers: {
            ["X-Foo2"]: "custom",
        },
        body: {
            name: "0xLLLLH",
        },
    });
    let response = await request.send();
    const dom = HTMLParser_1.default(response.body);
    const viewport = images(800, 600);
    render_1.render(viewport, dom);
    viewport.save(path.join(__dirname, "viewport.jpg"));
    debugger;
}
main();
