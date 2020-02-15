const rp = require('request-promise');
const {multiPath} = require('bobda');
const parser = require('fast-xml-parser');

const R = require('ramda');

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
  R.path(['dvds', 'dvd']),
  multiPath([
    [['titres'], ['title']],
    [['editeur'], ['editor']],
    [['annee'], ['year']]
  ]),
  R.pick(['media', 'cover', 'edition', 'editor', 'title', 'year']),
  R.over(R.lensProp('title'), reformatTitle)
);

const parseResponse = R.pipe(
  xmlParser,
  reformatDvdData
);

const getDVD = R.pipe(
  R.concat('http://www.dvdfr.com/api/search.php?gencode='),
  R.objOf('uri'),
  R.assoc('method', 'GET'),
  rp,
  R.andThen(parseResponse)
);

getDVD('3700301039316').then(x => console.log(x));
