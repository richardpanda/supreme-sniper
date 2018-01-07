require('dotenv').config();

const puppeteer = require('puppeteer');
const rp = require('request-promise');

const Checkout = require('./checkout');
const config = require('./config');
const order = require('./order');
const ReCaptcha = require('./recaptcha');
const Shop = require('./shop');

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

const sleep = ms => new Promise((resolve, reject) => (
  setTimeout(() => resolve(), ms)
));

(async () => {
  const shop = new Shop();
  // const clothing = await shop.fetchNewClothing();
  const clothing = await shop.fetchClothingFromAccessories();
  const pendingClothing = order.toPendingClothing(clothing);

  if (pendingClothing.length === 0) {
    console.log('Unable to find clothing in order.');
    return;
  }

  await shop.add(pendingClothing);

  await sleep(1000);

  const { cookies } = shop.jar._jar.toJSON();
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
  await c.complete();

  await page.waitFor(300);

  const rc = new ReCaptcha(page);
  rc.solve();
})();
