const categories = ['jackets', 'shirts', 'tops_sweaters', 'sweatshirts', 't-shirts']

class Clothing {
  constructor({ addEndpoint, available, color, name, price, s, st }) {
    this._addEndpoint = addEndpoint || '';
    this._available = available || false;
    this._color = color;
    this._name = name;
    this._price = price;
    this._s = s || null;
    this._st = st || '';
  }

  get addEndpoint() {
    return this._addEndpoint;
  }

  get available() {
    return this._available;
  }

  get color() {
    return this._color;
  }

  get name() {
    return this._name;
  }

  get st() {
    return this._st;
  }

  sizeCode(size) {
    return this._s[size];
  }

  static get urlRegex() {
    return new RegExp(`^\/shop\/${categories.join('|')}\/`);
  }
}

module.exports = Clothing;
