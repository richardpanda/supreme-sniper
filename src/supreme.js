const rp = require('request-promise');

const Clothing = require('./clothing');

const baseUrl = 'http://www.supremenewyork.com';
const userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.84 Safari/537.36';

class Supreme {
  constructor() {
    this._jar = rp.jar();
    this._request = rp.defaults({
      followAllRedirects: true,
      headers: {
        'User-Agent': userAgent,
      },
      jar: this._jar,
      resolveWithFullResponse: true,
    });
  }

  async addPendingClothing(pendingClothing) {
    for (let { uri, st, s } of pendingClothing) {
      await this._request({
        method: 'POST',
        uri: `${baseUrl}${uri}`,
        formData: {
          utf8: '✓',
          st,
          s,
          commit: 'add to cart',
        },
      });
    }
  }

  async fetchNewClothingHtmlDocs() {
    try {
      const res = await this._request({
        method: 'GET',
        uri: 'http://www.supremenewyork.com/shop/new',
      });
      const $ = cheerio.load(res.body);
      const requests = $('div.inner-article > a')
        .toArray()
        .map(elem => elem.attribs.href)
        .filter(url => url.match(Clothing.urlRegex))
        .map(url => this._request({ method: 'GET', uri: `${baseUrl}${url}`}));
      await Promise.all(requests);
      return requests.map(r => r.response.body);
    } catch (err) {
      throw err;
    }
  }

  getSession() {
    const { cookies } = this._jar._jar.toJSON();
    return cookies.find(({ key }) => key === '_supreme_sess' );
  }
}

module.exports = Supreme;
