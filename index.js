require('dotenv').config();

const cheerio = require('cheerio');
const fs = require('fs');
const puppeteer = require('puppeteer');
const rp = require('request-promise');
const SpeechToTextV1 = require('watson-developer-cloud/speech-to-text/v1');

const c = require('./config');
const converter = require('./converter');

const speechToText = new SpeechToTextV1({
  username: process.env.SUPREME_SNIPER__WATSON__USERNAME, 
  password: process.env.SUPREME_SNIPER__WATSON__PASSWORD,
});
const recognize = (params) => (
  new Promise((resolve, reject) => {
    speechToText.recognize(params, (err, transcript) => {
      if (err) {
        reject(err);
      }
      resolve(transcript);
    });
  })
);
const isCaptcha = (page) => (
  page.evaluate(() => {
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
  })
);

const jar = rp.jar();
const userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.84 Safari/537.36';
const request = rp.defaults({
  followAllRedirects: true,
  headers: {
    'User-Agent': userAgent,
  },
  jar,
  resolveWithFullResponse: true,
})

const sleep = ms => new Promise((resolve, reject) => (
  setTimeout(() => resolve(), ms)
));

(async () => {
  await request({
    method: 'POST',
    uri: 'http://www.supremenewyork.com/shop/171001/add',
    formData: {
      utf8: '✓',
      st: '18260',
      s: '49858',
      commit: 'add to cart',
    },
  });

  await sleep(1000);

  const { cookies } = jar._jar.toJSON();
  const supremeSession = cookies.find(({ key }) => key === '_supreme_sess' );

  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.setCookie({
    name: supremeSession.key,
    value: supremeSession.value,
    domain: '.supremenewyork.com',
    path: supremeSession.path,
    expires: new Date(supremeSession.expires).getTime() / 1000,
    httpOnly: supremeSession.httpOnly,
  });
  await page.setJavaScriptEnabled(true);
  await page.goto('http://www.supremenewyork.com/shop/cart');

  await page.click('a.button.checkout');

  await sleep(1000);

  const billingNameInput = await page.$('input#order_billing_name');
  await billingNameInput.type(c.billingName);

  const emailInput = await page.$('input#order_email');
  await emailInput.type(c.email);

  const telInput = await page.$('input#order_tel');
  await telInput.type(c.tel);

  const billingAddressInput = await page.$('input#bo');
  await billingAddressInput.type(c.billingAddress);

  const billingZipInput = await page.$('input#order_billing_zip');
  await billingZipInput.type(c.billingZip);

  const billingCityInput = await page.$('input#order_billing_city');
  await billingCityInput.type(c.billingCity);

  await page.select('select#order_billing_state', c.billingState);
  await page.select('select#order_billing_country', c.billingCountry);

  const nlbInput = await page.$('input#nnaerb');
  await nlbInput.type(c.nlb);

  await page.select('select#credit_card_month', c.month);
  await page.select('select#credit_card_year', c.year);

  const cvvInput = await page.$('input#orcer');
  await cvvInput.type(c.cvv);

  await page.click('label.has-checkbox.terms');
  await page.click('input[name="commit"]');

  await page.waitFor(300);

  let captcha = await isCaptcha(page);
  if (!captcha) {
    await page.waitFor(1000);
    return;
  }

  const recaptchaFrame = page.frames().find(f => Boolean(f.name()));

  const audioButton = await recaptchaFrame.$('#recaptcha-audio-button');
  await audioButton.click();
  await page.waitFor(300);

  do {
    const audioDownload = await recaptchaFrame.$('.rc-audiochallenge-tdownload-link');
    await audioDownload.click();
    await page.waitFor(2000);

    const m = __dirname.match(/^\/Users\/\w+/g);
    const downloadPath = m[0] + '/Downloads';
    const audioFileNames = fs.readdirSync(downloadPath)
      .filter(fn => fn.startsWith('audio'));
    const numAudioFiles = audioFileNames.length;
    const latestAudioFileName = numAudioFiles === 1
      ? 'audio.mp3'
      : `audio (${numAudioFiles-1}).mp3`;
    const filePath = `${downloadPath}/${latestAudioFileName}`;

    const params = {
      audio: fs.createReadStream(filePath),
      content_type: 'audio/mp3',
      model: 'en-US_NarrowbandModel',
    };
    const transcript = await recognize(params);

    const instructions = await recaptchaFrame.$eval('#audio-instructions', elem => elem.innerText);
    const isNumCaptcha = instructions === 'Press PLAY and enter the numbers you hear';

    let solution = '';
    if (isNumCaptcha) {
      solution = transcript.results
        .map(r => r.alternatives[0].transcript.trim())
        .map(word => textToNum(word))
        .join('');
    } else {
      solution = transcript.results
        .map(r => r.alternatives[0].transcript.trim())
        .join('');
    }
    console.log(solution);

    const playButton = await recaptchaFrame.$('.rc-button-default');
    await playButton.click();
    await page.waitFor(15000);
      
    const input = await recaptchaFrame.$('#audio-response');
    await input.type(solution, { delay: 200 });
    await page.waitFor(2000);
    
    const verifyButton = await recaptchaFrame.$('#recaptcha-verify-button');
    await verifyButton.click();
    await page.waitFor(3000);

    captcha = await isCaptcha(page);
  } while (captcha);
})();
