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
