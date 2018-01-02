const SpeechToTextV1 = require('watson-developer-cloud/speech-to-text/v1');

class Watson {
  constructor(username, password) {
    this._speechToText = new SpeechToTextV1({
      username,
      password,
    });
  }

  async recognize(params) {
    return new Promise((resolve, reject) => {
      this._speechToText.recognize(params, (err, transcript) => {
        if (err) {
          reject(err);
        }
        resolve(transcript);
      });
    });
  }
}

module.exports = Watson;
