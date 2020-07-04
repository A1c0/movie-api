const R = require('ramda');

const htmlAscii = /(?:&#)\d+(?:;)/g;

const containHtmlAscii = R.test(htmlAscii);
const createGlobalRegex = R.flip(R.curryN(2, RegExp))('g');

const convertAscii = R.pipe(
  R.match(/\d+/gm),
  R.head,
  String.fromCharCode
);

const getReplaceFunction = R.pipe(
  R.match(htmlAscii),
  R.uniq,
  R.map(R.converge(R.replace, [createGlobalRegex, convertAscii])),
  R.apply(R.pipe)
);

const parseAsciiHtml = R.when(
  containHtmlAscii,
  R.converge(R.call, [getReplaceFunction, R.identity])
);

module.exports = {parseAsciiHtml};
