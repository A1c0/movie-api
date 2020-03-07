const rp = require('request-promise');
const {multiPath} = require('bobda');
const parser = require('fast-xml-parser');

const R = require('ramda');
const L = require('loggy-log')();

const xmlParser = R.unary(parser.parse);

const defaultStringTo = R.curry((defaultValue, value) =>
  R.when(R.isEmpty, R.always(defaultValue))(value)
);

const getFrTitleIfNoDefined = R.pipe(
  R.prop('fr'),
  defaultStringTo
);

const reformatTitle = R.pipe(
  R.pick(['fr', 'vo']),
  R.converge(R.over(R.lensProp('vo')), [getFrTitleIfNoDefined, R.identity])
);

const reformatDvdData = R.pipe(
  L.trace('Reformat dvd : \n%fo'),
  R.path(['dvds', 'dvd']),
  multiPath([
    [['titres'], ['title']],
    [['editeur'], ['editor']],
    [['annee'], ['year']]
  ]),
  R.pick(['media', 'cover', 'edition', 'editor', 'title', 'year']),
  R.over(R.lensProp('title'), reformatTitle),
  L.trace('Data reformatted : \n%fo')
);

const parseResponse = R.pipe(
  xmlParser,
  reformatDvdData
);

const getDVD = R.pipe(
  L.debug('Send request to DVDFr for gencode: %s'),
  R.concat('http://www.dvdfr.com/api/search.php?gencode='),
  R.objOf('uri'),
  R.assoc('method', 'GET'),
  L.trace('request object : \n%fo'),
  rp,
  R.andThen(
    R.pipe(
      parseResponse,
      L.trace('request response: \n%fo')
    )
  )
);

module.exports = {getDVD};
