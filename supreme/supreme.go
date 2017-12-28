package supreme

import (
	"net/http"
	"net/http/cookiejar"
	"net/url"
	"strconv"
	"strings"

	"github.com/PuerkitoBio/goquery"
	"golang.org/x/net/publicsuffix"
)

type Client struct {
	http.Client
}

func NewClient() (*Client, error) {
	jar, err := cookiejar.New(&cookiejar.Options{PublicSuffixList: publicsuffix.List})
	if err != nil {
		return nil, err
	}

	return &Client{http.Client{Jar: jar}}, nil
}

func setUserAgent(req *http.Request) {
	req.Header.Set("User-Agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.84 Safari/537.36")
}

func (c *Client) AddItem() error {
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
	resp, err := c.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	return nil
}

func (c *Client) NumItems() (int, error) {
	u := "http://www.supremenewyork.com/shop/cart"
	req, err := http.NewRequest("GET", u, nil)
	if err != nil {
		return 0, err
	}

	setUserAgent(req)
	resp, err := c.Do(req)
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
