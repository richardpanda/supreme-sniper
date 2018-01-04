require('dotenv').config();

const fs = require('fs');
const puppeteer = require('puppeteer');
const rp = require('request-promise');

const ReCaptcha = require('./recaptcha');
const Checkout = require('./checkout');
const config = require('./config');
const transcript = require('./transcript');
const Watson = require('./watson');

const jar = rp.jar();
const userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.84 Safari/537.36';
const request = rp.defaults({
  followAllRedirects: true,
  headers: {
    'User-Agent': userAgent,
  },
  jar,
  resolveWithFullResponse: true,
});

const username = process.env.SUPREME_SNIPER__WATSON__USERNAME;
const password = process.env.SUPREME_SNIPER__WATSON__PASSWORD;
const w = new Watson(username, password);

const findAudioPath = () => {
  const m = __dirname.match(/^\/Users\/\w+/g);
  const downloadPath = m[0] + '/Downloads';
  const audioFileNames = fs.readdirSync(downloadPath)
    .filter(fn => fn.startsWith('audio'));
  const numAudioFiles = audioFileNames.length;
  const latestAudioFileName = numAudioFiles === 1
    ? 'audio.mp3'
    : `audio (${numAudioFiles-1}).mp3`;
  return `${downloadPath}/${latestAudioFileName}`;
};

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

  const c = new Checkout(config, page);
  await c.populateForm();
  await c.clickCheckbox();
  await c.clickProcessPayment();

  await page.waitFor(300);

  const rc = new ReCaptcha(page);
  if (await rc.isNotOpen()) {
    await page.waitFor(1000);
    return;
  }

  await rc.changeToAudioTest();
  await page.waitFor(300);

  while (await rc.isWordTest()) {
    await rc.reloadChallenge();
    await page.waitFor(300);
  }

  do {
    await rc.downloadAudio();
    await page.waitFor(2000);

    const params = {
      audio: fs.createReadStream(findAudioPath()),
      content_type: 'audio/mp3',
      model: 'en-US_NarrowbandModel',
    };
    const t = await w.recognize(params);
    const solution = transcript.toIntString(t);
    console.log(solution);

    await rc.playAudio();
    await page.waitFor(15000);
      
    await rc.typeSolution(solution);
    await page.waitFor(2000);
    
    await rc.verify();
    await page.waitFor(3000);

  } while (await rc.isOpen());
})();
