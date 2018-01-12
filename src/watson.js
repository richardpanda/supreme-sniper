const SpeechToTextV1 = require('watson-developer-cloud/speech-to-text/v1');

const username = process.env.SUPREME_SNIPER__WATSON__USERNAME;
const password = process.env.SUPREME_SNIPER__WATSON__PASSWORD;
const speechToText = new SpeechToTextV1({ username, password });

module.exports.recognize = async (params) => (
  new Promise((resolve, reject) => {
    speechToText.recognize(params, (err, transcript) => {
      if (err) {
        reject(err);
      }
      resolve(transcript);
    })
  })
);
