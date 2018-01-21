const fs = require('fs');

const audio = require('./audio');
const transcript = require('./transcript');
const watson = require('./watson');

class ReCaptcha {
  constructor(page) {
    this._page = page;
    this._frame = page.frames().find(f => Boolean(f.name()));
  }

  async changeToAudioTest() {
    const audioButton = await this._frame.$('#recaptcha-audio-button');
    await audioButton.click();
  }

  async downloadAudio() {
    const audioDownload = await this._frame.$('.rc-audiochallenge-tdownload-link');
    await audioDownload.click();
  }

  async isNumberTest() {
    const instructions = await this._frame.$eval('#audio-instructions', elem => elem.innerText);
    return instructions === 'Press PLAY and enter the numbers you hear';
  }

  async isOpen() {
    return this._page.evaluate(() => {
      const divs = document.querySelectorAll('div');
      for (let div of divs) {
        const style = div.getAttribute('style');
        if (style && style.startsWith('visibility')) {
          if (style.startsWith('visibility: visible;')) {
            return true;
          }
          return false;
        }
      }
      return false;
    });
  }

  async isNotOpen() {
    return !(await this.isOpen());
  }

  async isWordTest() {
    return !(await this.isNumberTest());
  }

  async playAudio() {
    const playButton = await this._frame.$('.rc-button-default');
    await playButton.click();
  }

  async reloadChallenge() {
    const reloadButton = await this._frame.$('#recaptcha-reload-button');
    await reloadButton.click();
  }

  async solve() {
    if (await this.isNotOpen()) {
      await this._page.waitFor(1000);
      return;
    }

    await this.changeToAudioTest();
    await this._page.waitFor(300);

    const downloadPath = __dirname.match(/^\/Users\/\w+/g)[0] + '/Downloads';
    let numAudioFiles = fs.readdirSync(downloadPath)
      .filter(fn => fn.startsWith('audio'))
      .length;

    do {
      while (await this.isWordTest()) {
        await this.reloadChallenge();
        await this._page.waitFor(300);
      }

      await this.downloadAudio();
      await this._page.waitFor(2000);

      const latestAudioFilePath = numAudioFiles === 0
        ? 'audio.mp3'
        : `audio (${numAudioFiles}).mp3`;
      numAudioFiles += 1;

      const params = {
        audio: fs.createReadStream(latestAudioFilePath),
        content_type: 'audio/mp3',
        model: 'en-US_NarrowbandModel',
      };
      const t = await watson.recognize(params);
      const solution = transcript.toIntString(t);
      console.log(solution);

      await this.playAudio();
      await this._page.waitFor(15000);
        
      await this.typeSolution(solution);
      await this._page.waitFor(2000);
      
      await this.verify();
      await this._page.waitFor(3000);

    } while (await this.isOpen());
  }

  async typeSolution(solution) {
    const input = await this._frame.$('#audio-response');
    await input.type(solution, { delay: 200 });
  }

  async verify() {
    const verifyButton = await this._frame.$('#recaptcha-verify-button');
    await verifyButton.click();
  }
}

module.exports = ReCaptcha;
