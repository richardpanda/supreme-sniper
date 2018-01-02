const {
  zero,
  one,
  two,
  three,
  four,
  five,
  six,
  seven,
  eight,
  nine,
} = require('./mapping.json');

module.exports.textToNum = (t) => {
  if (zero.includes(t)) {
    return 0;
  } else if (one.includes(t)) {
    return 1;
  } else if (two.includes(t) || t.endsWith('ew') || t.endsWith('do')) {
    return 2;
  } else if (three.includes(t) || t.includes('ee')) {
    return 3;
  } else if (four.includes(t) || t.includes('oor')) {
    return 4;
  } else if (five.includes(t) || t.includes('ive')) {
    return 5;
  } else if (six.includes(t) || t.endsWith('icks') || t.endsWith('ick') || t.endsWith('inks') || t.endsWith('ex')) {
    return 6;
  } else if (seven.includes(t) || t.includes('ven')) {
    return 7;
  } else if (eight.includes(t) || t.includes('ate')) {
    return 8;
  } else if (nine.includes(t)) {
    return 9;
  } else {
    return '';
  }
};
