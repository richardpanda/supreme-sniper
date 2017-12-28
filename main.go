package main

import (
	"fmt"
	"time"

	"github.com/richardpanda/supreme-sniper/bot"
)

func main() {
	b, err := bot.New()
	if err != nil {
		panic(err)
	}

	err = b.AddItem()
	if err != nil {
		panic(err)
	}

	time.Sleep(3 * time.Second)

	numItems, err := b.NumItems()
	if err != nil {
		panic(err)
	}

	fmt.Println(numItems)
}
