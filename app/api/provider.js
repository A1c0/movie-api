const R = require('ramda');

const {model} = require('../db/db');
const {throwNotFoundError} = require('./error');

const createProviderDB = R.bind(model.provider.create, model.provider);

const getProvidersDB = R.bind(model.provider.findAll, model.provider);
const getProviderDB = R.bind(model.provider.findOne, model.provider);

const createProvider = createProviderDB;

const updateProviderDB = R.invoker(1, 'update');
const deleteProviderDB = R.invoker(0, 'destroy');

const dbMetadata = ['createdAt', 'updatedAt'];

const getAllProviders = (userId) =>
  R.pipe(
    (x) => ({
      where: {userId: x},
      attributes: {exclude: dbMetadata},
    }),
    getProvidersDB,
    R.andThen(R.when(R.isEmpty, throwNotFoundError('There are no providers')))
  )(userId);

const getProvider = (providerId) =>
  R.pipe(
    (x) => ({
      where: {id: x},
      attributes: {exclude: dbMetadata},
      include: [model.movie],
    }),
    getProviderDB,
    R.andThen(
      R.when(
        R.isNil,
        throwNotFoundError(`There are no provider with id ${providerId}`)
      )
    )
  )(providerId);

const setProvider = (providerId, objToReplace) =>
  R.pipe(getProvider, R.andThen(updateProviderDB(objToReplace)))(providerId);

const deleteProvider = R.pipe(getProvider, R.andThen(deleteProviderDB));

module.exports = {
  createProvider,
  getAllProviders,
  getProvider,
  setProvider,
  deleteProvider,
};
