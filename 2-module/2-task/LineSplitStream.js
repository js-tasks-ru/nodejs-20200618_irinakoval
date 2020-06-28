const stream = require('stream');
const os = require('os');

class LineSplitStream extends stream.Transform {
  constructor(options) {
    options = {
      encoding: 'utf-8',
      ...options,
    };
    super(options);

    this.savedString = '';
  }

  _transform(chunk, encoding, callback) {
    let dataArr;
    let error;
    const data = chunk.toString();
    try {
      if (data.indexOf(os.EOL) !== -1) {
        dataArr = data.split(os.EOL);
        dataArr.forEach((item, i) => {
          if (i === 0) {
            this.push(this.savedString + item);
            return;
          }
          if (i === dataArr.length - 1) {
            this.savedString = item;
            return;
          }
          this.push(item);
        });
      } else {
        this.savedString += data;
      }
    } catch (e) {
      error = e;
    }
    callback(error);
  }

  _flush(callback) {
    callback(null, this.savedString);
  }
}

module.exports = LineSplitStream;
