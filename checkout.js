class Checkout {
  constructor(config, page) {
    this._page = page;
    this._cfg = config;
  }

  async clickCheckbox() {
    await this._page.click('label.has-checkbox.terms');
  }

  async clickProcessPayment() {
    await this._page.click('input[name="commit"]');
  }

  async populateForm() {
    const c = this._cfg;
    const p = this._page;

    const billingNameInput = await p.$('input#order_billing_name');
    await billingNameInput.type(c.billingName);

    const emailInput = await p.$('input#order_email');
    await emailInput.type(c.email);

    const telInput = await p.$('input#order_tel');
    await telInput.type(c.tel);

    const billingAddressInput = await p.$('input#bo');
    await billingAddressInput.type(c.billingAddress);

    const billingZipInput = await p.$('input#order_billing_zip');
    await billingZipInput.type(c.billingZip);

    const billingCityInput = await p.$('input#order_billing_city');
    await billingCityInput.type(c.billingCity);

    await p.select('select#order_billing_state', c.billingState);
    await p.select('select#order_billing_country', c.billingCountry);

    const nlbInput = await p.$('input#nnaerb');
    await nlbInput.type(c.nlb);

    await p.select('select#credit_card_month', c.month);
    await p.select('select#credit_card_year', c.year);

    const cvvInput = await p.$('input#orcer');
    await cvvInput.type(c.cvv);
  }
}

module.exports = Checkout;
