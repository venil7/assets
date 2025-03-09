package repository

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	"github.com/samber/do"
)

const USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36"

// func GetSearchDuplex() d.Duplex[string, Ticker] {
// 	req := make(chan string)
// 	res := make(chan func() (Ticker, error))
// 	go func() {
// 		for ticker := range req {

// 		}
// 		defer close(res)
// 	}()
// 	return d.Duplex[string, Ticker]{Req: req, Res: res}

// }

type Ticker struct {
	Exchange  string `json:"exchange"`
	ShortName string `json:"shortname"`
	QuoteType string `json:"quoteType"`
	Symbol    string `json:"symbol"`
	LongName  string `json:"longname"`
}

type YahooService struct {
	client http.Client
}

func NewYahooService() YahooService {
	client := http.Client{}
	return YahooService{client}
}

type TickerSearchResult struct {
	Tickers []Ticker `json:"quotes"`
}

func YahooServiceProvider(i *do.Injector) (*YahooService, error) {
	repo := NewYahooService()
	return &repo, nil
}

func (service *YahooService) LookupTicker(term string) (*TickerSearchResult, error) {
	url := fmt.Sprintf("https://query2.finance.yahoo.com/v1/finance/search?q=%s", term)

	req, err := http.NewRequest("GET", url, nil)
	req.Header.Set("User-Agent", USER_AGENT)

	resp, err := service.client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("failed to fetch data: %s", resp.Status)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	var result TickerSearchResult
	err = json.Unmarshal(body, &result)
	if err != nil {
		return nil, err
	}

	return &result, nil
}
