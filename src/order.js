const myOrder = require('./my-order');
const PendingClothing = require('./pending-clothing');

module.exports.toPendingClothing = colorsByName => (
  myOrder.reduce((res, { name, color, size }) => {
    const clothingByColor = colorsByName.get(name.toLowerCase());
    if (!clothingByColor) {
      return res;
    }

    const clothing = clothingByColor.get(color.toLowerCase());
    if (!clothing) {
      return res;
    }

    return [...res, new PendingClothing(
      clothing.addEndpoint,
      clothing.st,
      clothing.sizeCode(size.toLowerCase())),
    ];
  }, [])
);
