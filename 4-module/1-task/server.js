const url = require('url');
const http = require('http');
const path = require('path');
const fs = require('fs');

const server = new http.Server();

server.on('request', (req, res) => {
  try {
    const pathname = url.parse(req.url).pathname.slice(1);

    const filepath = path.join(__dirname, 'files', pathname);

    switch (req.method) {
      case 'GET':
        if (pathname.indexOf('/') !== -1) {
          res.statusCode = 400;
          res.end('Inner folders are not supported!');
          return;
        }
        const readStream = fs.createReadStream(filepath);
        readStream.on('open', function() {
          // This just pipes the read stream to the response object (which goes to the client)
          readStream.pipe(res);
        });
        readStream.on('error', function(err) {
          res.statusCode = 404;
          res.end(err.message);
        });
        break;

      default:
        res.statusCode = 501;
        res.end('Not implemented');
    }
  } catch (e) {
    res.statusCode = 500;
    res.end(e.message);
  }
}

);

module.exports = server;
