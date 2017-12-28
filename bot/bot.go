package bot

import (
	"encoding/json"
	"errors"
	"io/ioutil"
	"net/http"
	"net/http/cookiejar"
	"net/url"
	"strconv"
	"strings"

	"github.com/PuerkitoBio/goquery"
	"golang.org/x/net/publicsuffix"
)

type Bot struct {
	http.Client
}

type config struct {
	BillingName    string `json:"billing_name"`
	Email          string `json:"email"`
	Tel            string `json:"tel"`
	BillingAddress string `json:"billing_address"`
	BillingZip     string `json:"billing_zip"`
	BillingCity    string `json:"billing_city"`
	BillingState   string `json:"billing_state"`
	BillingCountry string `json:"billing_country"`
	NLB            string `json:"nlb"`
	Month          string `json:"month"`
	Year           string `json:"year"`
	RVV            string `json:"rvv"`
}

func New() (*Bot, error) {
	jar, err := cookiejar.New(&cookiejar.Options{PublicSuffixList: publicsuffix.List})
	if err != nil {
		return nil, err
	}

	return &Bot{http.Client{Jar: jar}}, nil
}

func loadConfig() (*config, error) {
	b, err := ioutil.ReadFile("config.json")
	if err != nil {
		return nil, err
	}

	var cfg config
	err = json.Unmarshal(b, &cfg)
	if err != nil {
		return nil, err
	}

	return &cfg, nil
}

func setUserAgent(req *http.Request) {
	req.Header.Set("User-Agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.84 Safari/537.36")
}

func (b *Bot) AddItem() error {
	u := "http://www.supremenewyork.com/shop/171001/add"
	v := url.Values{}
	v.Set("utf8", "✓")
	v.Set("st", "18260")
	v.Set("s", "49858")
	v.Set("commit", "add to cart")

	req, err := http.NewRequest("POST", u, strings.NewReader(v.Encode()))
	if err != nil {
		return err
	}

	setUserAgent(req)
	resp, err := b.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	return nil
}

func (b *Bot) CheckOut() error {
	cfg, err := loadConfig()
	if err != nil {
		return err
	}

	doc, err := b.checkoutPage()
	if err != nil {
		return err
	}

	asec, ok := doc.Find("#asec").Attr("value")
	if !ok {
		return errors.New("could not find asec")
	}

	csrfToken, ok := doc.Find("meta[name='csrf-token']").Attr("content")
	if !ok {
		return errors.New("could not find csrf token")
	}

	u := "https://www.supremenewyork.com/checkout.json"
	v := url.Values{}
	v.Set("utf8", "✓")
	v.Set("authenticity_token", csrfToken)
	v.Set("order[billing_name]", cfg.BillingName)
	v.Set("order[email]", cfg.Email)
	v.Set("order[tel]", cfg.Tel)
	v.Set("order[billing_address]", cfg.BillingAddress)
	v.Set("order[billing_address_2]", "")
	v.Set("order[billing_zip]", cfg.BillingZip)
	v.Set("order[billing_city]", cfg.BillingCity)
	v.Set("order[billing_state]", cfg.BillingState)
	v.Set("order[billing_country]", cfg.BillingCountry)
	v.Set("asec", asec)
	v.Set("same_as_billing_address", "1")
	v.Set("store_credit_id", "")
	v.Set("credit_card[nlb]", cfg.NLB)
	v.Set("credit_card[month]", cfg.Month)
	v.Set("credit_card[year]", cfg.Year)
	v.Set("credit_card[rvv]", cfg.RVV)
	v.Set("order[terms]", "0")
	v.Set("order[terms]", "1")
	v.Set("g-recaptcha-response", "")
	v.Set("credit_card[vval]", "")

	req, err := http.NewRequest("POST", u, strings.NewReader(v.Encode()))
	if err != nil {
		return err
	}

	setUserAgent(req)
	req.Header.Set("X-CSRF-TOKEN", csrfToken)
	resp, err := b.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	return nil
}

func (b *Bot) checkoutPage() (*goquery.Document, error) {
	resp, err := b.Get("https://www.supremenewyork.com/checkout")
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	doc, err := goquery.NewDocumentFromResponse(resp)
	if err != nil {
		return nil, err
	}

	return doc, nil
}

func (b *Bot) NumItems() (int, error) {
	u := "http://www.supremenewyork.com/shop/cart"
	req, err := http.NewRequest("GET", u, nil)
	if err != nil {
		return 0, err
	}

	setUserAgent(req)
	resp, err := b.Do(req)
	if err != nil {
		return 0, err
	}
	defer resp.Body.Close()

	doc, err := goquery.NewDocumentFromResponse(resp)
	if err != nil {
		return 0, err
	}

	numItems, err := strconv.Atoi(strings.Split(doc.Find("#items-count").First().Text(), " ")[0])
	if err != nil {
		return 0, err
	}

	return numItems, nil
}
