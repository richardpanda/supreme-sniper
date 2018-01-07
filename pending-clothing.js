class PendingClothing {
  constructor(uri, st, s) {
    this._uri = uri;
    this._st = st;
    this._s = s;
  }

  get uri() {
    return this._uri;
  }

  get st() {
    return this._st;
  }

  get s() {
    return this._s;
  }
}

module.exports = PendingClothing;
