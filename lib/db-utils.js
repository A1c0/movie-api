const R = require('ramda');

const formatNotFountMessage = R.pipe(
  R.toPairs,
  R.map(R.join(' ')),
  R.join(' and ')
);

const dbMetadata = ['createdAt', 'updatedAt'];

module.exports = {formatNotFountMessage, dbMetadata};
