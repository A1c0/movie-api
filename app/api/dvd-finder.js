const bent = require('bent');
const {multiPath, promiseMap, promiseProps} = require('bobda');
const parser = require('fast-xml-parser');
const {parseAsciiHtml} = require('../../lib/html-ascii');
const R = require('ramda');
const L = require('loggy-log')();
const JustWatch = require('justwatch-api');

const getDvdByDVDFr = bent(
  'https://www.dvdfr.com/api/search.php?gencode=',
  'string'
);

const justwatch = new JustWatch({locale: 'fr_FR'});

const computePoster = R.pipe(
  R.prop('poster'),
  R.replace(/{profile}/gm, 's166'),
  R.concat('https://images.justwatch.com')
);

const getActors = R.pipe(
  R.prop('credits'),
  R.filter(R.propEq('role', 'ACTOR')),
  R.map(R.prop('name'))
);

const getDirector = R.pipe(
  R.prop('credits'),
  R.find(R.propEq('role', 'DIRECTOR')),
  R.prop('name')
);

const reformatMovie = R.applySpec({
  title: R.prop('title'),
  originalTitle: R.prop('original_title'),
  actors: getActors,
  director: getDirector,
  year: R.prop('original_release_year'),
  justwatchId: R.prop('id'),
  imageUrl: computePoster,
});

const getJustWatchMovieByTitle = R.pipe(
  R.path(['items', 0, 'id']),
  R.curry(R.bind(justwatch.getTitle, justwatch))('movie')
);

const getMovie = R.pipe(
  R.unary(R.bind(justwatch.search, justwatch)),
  R.andThen(getJustWatchMovieByTitle),
  R.andThen(reformatMovie)
);

const xmlParser = R.unary(parser.parse);

const joinFrVo = R.pipe(R.props(['fr', 'vo']), R.join(';'));

const collectionKeyWords = ['coffret', 'trilogie', 'collection', 'intégrale'];

const containCollectionKeyWords = R.pipe(
  R.toLower,
  R.anyPass(R.map(R.includes)(collectionKeyWords))
);

const isCollection = R.pipe(joinFrVo, containCollectionKeyWords);

const isCollectionTreatable = R.pipe(joinFrVo, R.includes('+'));

const getMoviesTitleFromCollection = R.pipe(
  R.values,
  R.find(R.includes('+')),
  R.replace(/(?:.*)(?:-)/gm, ''),
  R.split('+'),
  R.map(R.trim)
);

const getMoviesTitle = R.cond([
  [
    R.allPass([isCollection, isCollectionTreatable]),
    getMoviesTitleFromCollection,
  ],
  [isCollection, R.always([])],
  [R.T, R.pipe(R.prop('fr'), R.of)],
]);

const getMovies = promiseMap(getMovie);

const getProviderName = R.ifElse(
  isCollection,
  R.pipe(R.values, R.find(containCollectionKeyWords)),
  R.prop('fr')
);

const reformatDvdData = R.pipe(
  R.path(['dvds', 'dvd']),
  multiPath([
    [['titres'], ['movies']],
    [['editeur'], ['editor']],
    [['annee'], ['year']],
  ]),
  R.pick(['media', 'cover', 'editor', 'movies', 'year']),
  R.over(R.lens(R.prop('movies'), R.assoc('name')), getProviderName),
  R.over(R.lensProp('movies'), getMoviesTitle)
);

const parseEachHTMLAttribute = (value) =>
  R.pipe(
    R.cond([
      [R.is(String), parseAsciiHtml],
      [R.is(Array), R.map(parseEachHTMLAttribute)],
      [R.is(Object), R.mapObjIndexed(parseEachHTMLAttribute)],
      [R.T, R.identity],
    ])
  )(value);

const parseResponse = R.pipe(
  L.trace('Reformat dvd : \n%fo'),
  xmlParser,
  reformatDvdData,
  parseEachHTMLAttribute,
  L.trace('Data reformatted : \n%fo')
);

const getDVD = (barcode) =>
  R.pipe(
    L.debug('Send request to DVDFr for barcode: %s'),
    getDvdByDVDFr,
    R.andThen(parseResponse),
    R.andThen(R.pipe(R.over(R.lensProp('movies'), getMovies), promiseProps)),
    R.andThen(R.assoc('barcode', barcode))
  )(barcode);

module.exports = {getDVD};

// getMovie('Back to the Future').then(L.debug('result: %fo'));

// getDVD('3259190302198').then(L.debug('result: %fo'));
