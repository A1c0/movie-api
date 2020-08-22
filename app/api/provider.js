const R = require('ramda');

const {Provider, Movie} = require('../db/index');
const {tryCatchPromise} = require('../../lib/ramda-utils');
const {throwNotFoundError} = require('./error');
const {formatNotFountMessage, dbMetadata} = require('../../lib/db-utils');

const createProviderDB = R.bind(Provider.create, Provider);
const getProvidersDB = R.bind(Provider.findAll, Provider);
const getProviderDB = R.bind(Provider.findOne, Provider);
const createProvider = createProviderDB;

const updateProviderDB = R.invoker(1, 'update');
const deleteProviderDB = R.invoker(0, 'destroy');

const getAllProviders = userId =>
  R.pipe(
    x => ({
      where: {userId: x},
      attributes: {exclude: dbMetadata}
    }),
    getProvidersDB,
    R.andThen(R.when(R.isEmpty, throwNotFoundError('There are no providers')))
  )(userId);

const getProvider = providerObjProp =>
  R.pipe(
    x => ({
      where: x,
      attributes: {exclude: dbMetadata},
      include: [Movie]
    }),
    getProviderDB,
    R.andThen(
      R.when(
        R.isNil,
        throwNotFoundError(
          `There are no provider with ${formatNotFountMessage(providerObjProp)}`
        )
      )
    )
  )(providerObjProp);

const setProvider = (providerId, objToReplace) =>
  R.pipe(getProvider, R.andThen(updateProviderDB(objToReplace)))(providerId);

const deleteProvider = R.pipe(getProvider, R.andThen(deleteProviderDB));

const tryCreateOrGetProvider = tryCatchPromise(
  createProvider,
  R.pipe(R.pick(['barcode']), getProvider)
);

module.exports = {
  tryCreateOrGetProvider,
  createProvider,
  getAllProviders,
  getProvider,
  setProvider,
  deleteProvider
};
