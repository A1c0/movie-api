const R = require('ramda');

const tryParse = x => R.tryCatch(JSON.parse, R.always(x))(x);
const parseEachProperty = R.mapObjIndexed(tryParse);

module.exports = {parseEachProperty};
