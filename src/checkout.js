class Checkout {
  constructor(info, page) {
    this._info = info;
    this._page = page;
  }

  async clickCheckbox() {
    await this._page.click('label.has-checkbox.terms');
  }

  async clickProcessPayment() {
    await this._page.click('input[name="commit"]');
  }

  async complete() {
    await this.populateForm();
    await this.clickCheckbox();
    await this.clickProcessPayment();
  }

  async populateForm() {
    const info = this._info;
    const page = this._page;

    const billingNameInput = await page.$('input#order_billing_name');
    await billingNameInput.type(info.billingName);

    const emailInput = await page.$('input#order_email');
    await emailInput.type(info.email);

    const telInput = await page.$('input#order_tel');
    await telInput.type(info.tel);

    const billingAddressInput = await page.$('input#bo');
    await billingAddressInput.type(info.billingAddress);

    const billingZipInput = await page.$('input#order_billing_zip');
    await billingZipInput.type(info.billingZip);

    const billingCityInput = await page.$('input#order_billing_city');
    await billingCityInput.type(info.billingCity);

    await page.select('select#order_billing_state', info.billingState);
    await page.select('select#order_billing_country', info.billingCountry);

    const nlbInput = await page.$('input#nnaerb');
    await nlbInput.type(info.nlb);

    await page.select('select#credit_card_month', info.month);
    await page.select('select#credit_card_year', info.year);

    const cvvInput = await page.$('input#orcer');
    await cvvInput.type(info.cvv);
  }
}

module.exports = Checkout;
