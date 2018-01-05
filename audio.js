const fs = require('fs');

module.exports.findLatestPath = () => {
  const m = __dirname.match(/^\/Users\/\w+/g);
  const downloadPath = m[0] + '/Downloads';
  const audioFileNames = fs.readdirSync(downloadPath)
    .filter(fn => fn.startsWith('audio'));
  const numAudioFiles = audioFileNames.length;
  const latestAudioFileName = numAudioFiles === 1
    ? 'audio.mp3'
    : `audio (${numAudioFiles-1}).mp3`;
  return `${downloadPath}/${latestAudioFileName}`;
}
