const R = require('ramda');
const L = require('loggy-log')();

const {model, init} = require('../db/db');
const {throwNotFoundError} = require('./error');

const createMovieDB = R.bind(model.movie.create, model.movie);

const getMoviesDB = R.bind(model.movie.findAll, model.movie);
const getMovieDB = R.bind(model.movie.findOne, model.movie);

const createMovie = createMovieDB;

const updateMovieDB = R.invoker(1, 'update');
const deleteMovieDB = R.invoker(0, 'destroy');

const dbMetadata = ['createdAt', 'updatedAt'];

const getAllMovies = (userId) =>
  R.pipe(
    (x) => ({
      where: {userId: x},
      attributes: {exclude: dbMetadata},
    }),
    getMoviesDB,
    R.andThen(R.when(R.isEmpty, throwNotFoundError('There are no movies')))
  )(userId);

const formatNotFountMessage = R.pipe(
  R.toPairs,
  R.map(R.join(' ')),
  R.join(' and ')
);

const getMovie = (movieObjProp) =>
  R.pipe(
    (x) => ({
      where: x,
      attributes: {exclude: dbMetadata},
    }),
    getMovieDB,
    R.andThen(
      R.when(
        R.isNil,
        throwNotFoundError(
          `There are no movie with ${formatNotFountMessage(movieObjProp)}`
        )
      )
    )
  )(movieObjProp);

const setMovie = (movieId, objToReplace) =>
  R.pipe(getMovie, R.andThen(updateMovieDB(objToReplace)))(movieId);

const deleteMovie = R.pipe(getMovie, R.andThen(deleteMovieDB));

const tryCatchPromise = R.curry(async (fnTry, fnCatch, value) => {
  try {
    return await Promise.resolve(fnTry(value));
  } catch (e) {
    return await Promise.resolve(fnCatch(value));
  }
});

const tryCreateOrGetMovie = tryCatchPromise(
  createMovie,
  R.pipe(R.pick(['title']), getMovie)
);

module.exports = {
  tryCreateOrGetMovie,
  createMovie,
  getAllMovies,
  getMovie,
  setMovie,
  deleteMovie,
};

const test = async () => {
  await init();

  const obj = {
    title: 'title',
    originalTitle: 'originalTitle',
    actors: ['actor1', 'actor2'],
    director: 'director',
    justwatchId: '1234',
    year: 2001,
    imageUrl: null,
  };
  const movie = await tryCreateOrGetMovie(obj);
  console.log(movie);
};

test();
