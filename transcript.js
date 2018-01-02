const converter = require('./converter');

module.exports.toIntString = ({ results }) => (
  results
    .map(r => r.alternatives[0].transcript.trim())
    .map(word => converter.textToNum(word))
    .join('')
);

module.exports.toString = ({ results }) => (
  results
    .map(r => r.alternatives[0].transcript.trim())
    .join(' ')
);
