/*
* Primary file for an API
*
*/

// 1. Dependencies
const http = require('http');
const https = require('https');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const fs = require('fs');
const config = require('./config');


// 2. Server
const httpServer = http.createServer((req, res) => {
    unifiedServer(req, res);
});
httpServer.listen(config.httpPort, () => console.log(`Running on port: ${config.httpPort}`));

const httpsServerOptions = {
    'key': fs.readFileSync('./https/key.pem'),
    'cert': fs.readFileSync('./https/cert.pem')
};
const httpsServer = https.createServer(httpsServerOptions, (req, res) => {
    unifiedServer(req, res);
});

const unifiedServer = (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const path = parsedUrl.pathname;
    const trimmedPath = path.replace(/^\/||\/+$/g, '');
    const queryStringObject = parsedUrl.query;
    const headers = req.headers;
    const method = req.method.toLowerCase();
    const decoder = new StringDecoder('utf-8');
    let buffer = '';

    req.on('data', (data) => {
        buffer += decoder.write(data);
    });
    req.on('end', () => {
        buffer += decoder.end();

        const choseHandler = typeof (router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

        const data = {
            'trimmedPath': trimmedPath,
            'queryStringObject': queryStringObject,
            'headers': headers,
            'method': method,
            'payload': buffer
        };

        choseHandler(data, function (statusCode, payload) {
            statusCode = typeof (statusCode) == 'number' ? statusCode : 200;
            payload = typeof (payload) == 'object' ? payload : {};
            const payloadString = JSON.stringify(payload);

            res.setHeader('Content-Type', 'application/json');
            res.writeHead(statusCode);
            res.end(payloadString);
            console.log(`Respond with this ${statusCode} ${payloadString}`);
        });
    });
}

// 3. Handlers
const handlers = {};

handlers.ping = function (data, callback) {
    callback(200, { 'ping': 'ping ping ping' });
};

handlers.notFound = function (data, callback) {
    callback(404);
};

// 4. Router
const router = {
    'ping': handlers.ping
};