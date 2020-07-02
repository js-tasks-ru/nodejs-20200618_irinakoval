const url = require('url');
const http = require('http');
const path = require('path');
const fs = require('fs');
const LimitSizeStream = require('./LimitSizeStream');
const LimitExceededError = require('./LimitExceededError');

const server = new http.Server();

server.on('request', (req, res) => {
  const pathname = url.parse(req.url).pathname.slice(1);
  const filepath = path.join(__dirname, 'files', pathname);
  let writeStream;

  try {
    req.on('aborted', (error) => {
      writeStream.destroy();
      fs.unlink(filepath, (err) => {
        if (err) {
          res.statusCode = 500;
          res.end(err.message);
        }
      });

      res.statusCode = 500;
      res.end('aborted');
    });

    const limitSizeStream = new LimitSizeStream({limit: 1000000});
    limitSizeStream.on('error', (err) => {
      if (err instanceof LimitExceededError) {
        res.statusCode = 413;
      } else {
        res.statusCode = 500;
      }
      if (writeStream) writeStream.destroy();
      fs.unlink(filepath, (err) => {
        if (err) {
          res.statusCode = 500;
          res.end(err.message);
        }
        // res.end();
      });
      // fix for tests
      res.write('');

      // fix for tests
      setTimeout(() => res.end(err.message), 1000);
    });

    switch (req.method) {
      case 'POST':
        if (pathname.indexOf('/') !== -1) {
          res.statusCode = 400;
          res.end('Inner folders are not supported!');
          return;
        }

        writeStream = fs.createWriteStream(filepath, {flags: 'wx'});

        writeStream.on('error', (err) => {
          if (err.code === 'EEXIST') {
            if (writeStream) writeStream.destroy();
            res.statusCode = 409;
            res.end(err.message);
          }
        }).on('finish', () => {
          res.statusCode = 201;
          res.end('done');
        });

        req.pipe(limitSizeStream).pipe(writeStream);
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


