const R = require('ramda');

const { tryCreateOrGetMovie } = require('./movie');
const { tryCreateOrGetProvider } = require('./provider');
const { getUser } = require('./user');
const { promiseMap, promiseAll } = require('bobda');
const {
  juxtAsyncInOrder,
  reduceWithArrayFnAsync
} = require('./../../lib/ramda-utils');

const createMoviesProvider = R.pipe(
  R.prop('movies'),
  promiseMap(tryCreateOrGetMovie)
);

const linkProviderToMovies = R.curry((movies, provider) =>
  R.invoker(1, 'setMovies')(movies)(provider)
);

const linkProviderToUser = R.curry((provider, user) =>
  R.invoker(1, 'setProviders')(provider)(user)
);

const createUserProviderWithMovies = (userId, provider) =>
  R.pipe(
    juxtAsyncInOrder([
      () => getUser({ id: userId }),
      tryCreateOrGetProvider,
      createMoviesProvider
    ]),
    promiseAll,
    R.andThen(reduceWithArrayFnAsync([]))
  )(provider);

module.exports = { createUserProviderWithMovies };
