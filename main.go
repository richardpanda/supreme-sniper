package main

import (
	"fmt"
	"time"

	"github.com/richardpanda/supreme-sniper/supreme"
)

func main() {
	c, err := supreme.NewClient()
	if err != nil {
		panic(err)
	}

	err = c.AddItem()
	if err != nil {
		panic(err)
	}

	time.Sleep(3 * time.Second)

	numItems, err := c.NumItems()
	if err != nil {
		panic(err)
	}

	fmt.Println(numItems)
}
