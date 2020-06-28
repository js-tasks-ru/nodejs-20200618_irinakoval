const stream = require('stream');
const LimitExceededError = require('./LimitExceededError');

class LimitSizeStream extends stream.Transform {
  constructor(options) {
    options = {
      encoding: 'utf-8',
      limit: 10,
      ...options,
    };
    super(options);

    this.sumLength = 0;
    this.limit = options.limit;
  }

  _transform(chunk, encoding, callback) {
    let data;
    let error;
    this.sumLength += chunk.length;
    if (this.sumLength <= this.limit) {
      data = chunk;
    } else {
      error = new LimitExceededError();
    }
    callback(error, data);
  }
}

module.exports = LimitSizeStream;
