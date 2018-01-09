const cheerio = require('cheerio');

const PendingClothing = require('./pending-clothing');

class Inventory {
  constructor(htmlDocs) {
    this._clothing = htmlDocs
      .map((htmlDoc) => {
        const $ = cheerio.load(htmlDoc);
        const st = $('#st').attr('value') || '';
        const name = $('h1[itemprop="name"]').text().toLowerCase();
        const color = $('p[itemprop="model"]').text().toLowerCase();
        const available = Boolean(st);
        const price = parseInt($('span[itemprop="price"]').text().substring(1), 10);
        const addEndpoint = available
          ? $('#cart-addf').attr('action')
          : '';
        const s = available
          ? $('#s')
              .children()
              .map(function(_, elem) {
                return { s: elem.attribs.value, size: $(this).text().toLowerCase() };
              })
              .toArray()
              .reduce((res, { s, size }) =>  res.set(size.toLowerCase(), s), new Map())
          : null;
        return new Clothing({ addEndpoint, available, color, name, price, s, st });
      })
      .reduce((res, clothing) => {
        if (!res.has(clothing.name)) {
          res.set(clothing.name, new Map());
        }
        res.get(clothing.name).set(clothing.color, clothing);
        return res;
      }, new Map());
  }

  getClothing(name, color) {
    const clothingByColor = this._clothing.get(name);
    if (!clothingByColor) {
      return null;
    }

    const clothing = clothingByColor.get(color);
    if (!clothing) {
      return null;
    }

    return clothing;
  }

  toPendingClothing(order) {
    return order.reduce((res, { name, color, size }) => {
      const clothing = this.getClothing(name.toLowerCase(), color.toLowerCase());
      if (clothing === null) {
        return res;
      }

      return [...res, new PendingClothing(
        clothing.addEndpoint,
        clothing.st,
        clothing.sizeCode(size.toLowerCase())),
      ];
    }, []);
  }
}

module.exports = Inventory; 
