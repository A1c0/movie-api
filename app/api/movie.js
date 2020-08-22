const R = require('ramda');
const L = require('loggy-log')();

const {Movie} = require('../db/index');
const {throwNotFoundError} = require('./error');
const {tryCatchPromise} = require('../../lib/ramda-utils');
const {formatNotFountMessage, dbMetadata} = require('../../lib/db-utils');

const createMovieDB = R.bind(Movie.create, Movie);
const getMoviesDB = R.bind(Movie.findAll, Movie);
const getMovieDB = R.bind(Movie.findOne, Movie);
const createMovie = createMovieDB;

const updateMovieDB = R.invoker(1, 'update');
const deleteMovieDB = R.invoker(0, 'destroy');

const getAllMovies = (userId) =>
  R.pipe(
    (x) => ({
      where: {userId: x},
      attributes: {exclude: dbMetadata},
    }),
    getMoviesDB,
    R.andThen(R.when(R.isEmpty, throwNotFoundError('There are no movies')))
  )(userId);

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
          `There is no movie with ${formatNotFountMessage(movieObjProp)}`
        )
      )
    )
  )(movieObjProp);

const setMovie = (movieId, objToReplace) =>
  R.pipe(getMovie, R.andThen(updateMovieDB(objToReplace)))(movieId);

const deleteMovie = R.pipe(getMovie, R.andThen(deleteMovieDB));

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
