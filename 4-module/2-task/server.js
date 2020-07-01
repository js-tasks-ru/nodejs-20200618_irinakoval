const url = require('url');
const http = require('http');
const path = require('path');
const fs = require('fs');
const LimitSizeStream = require('./LimitSizeStream');
const LimitExceededError = require('./LimitExceededError');

const server = new http.Server();

server.on('request', (req, res) => {
  try {
    const pathname = url.parse(req.url).pathname.slice(1);
    const filepath = path.join(__dirname, 'files', pathname);
    const limitSizeStream = new LimitSizeStream({limit: 1000000});

    switch (req.method) {
      case 'POST':
        if (pathname.indexOf('/') !== -1) {
          res.statusCode = 400;
          res.end('Inner folders are not supported!');
          return;
        }

        const writeStream = fs.createWriteStream(filepath, {flags: 'wx'});
        limitSizeStream.pipe(writeStream);

        limitSizeStream.on('error', (err) => {
          if (err instanceof LimitExceededError) {
            res.statusCode = 413;
          } else {
            res.statusCode = 500;
          }
          limitSizeStream.resume();
          writeStream.end();
          fs.unlink(filepath, (err) => {
            if (err) {
              res.statusCode = 500;
              res.end(err.message);
            }
          });
          res.end(err.message);
        });

        writeStream.on('error', (err) => {
          if ( err.code === 'EEXIST') {
            res.statusCode = 409;
          }
          res.end(err.message);
        }).on('finish', () => {
          res.statusCode = 201;
          res.end('done');
        });

        req.on('data', (chunk) => {
          limitSizeStream.write(chunk);
        }).on('end', () => {
          limitSizeStream.resume();
          writeStream.end();
        }).on('error', (error) => {
          writeStream.end();
          fs.unlink(filepath, (err) => {
            res.statusCode = 500;
            res.end(error.message);
          });
          res.statusCode = 500;
          res.end(error.message);
        }).on('aborted', (error) => {
          writeStream.end();
          fs.unlink(filepath, (err) => {
            if (err) {
              res.statusCode = 500;
              res.end(err.message);
            }
          });
          res.statusCode = 500;
          res.end('aborted');
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
});

module.exports = server;
