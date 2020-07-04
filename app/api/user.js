const R = require('ramda');

const {model} = require('../db/db');
const {throwNotFoundError} = require('./error');

const createUserDB = R.bind(model.user.create, model.user);

const getUsersDB = R.bind(model.user.findAll, model.user);
const getUserDB = R.bind(model.user.findOne, model.user);

const createUser = createUserDB;

const updateUserDB = R.invoker(1, 'update');
const deleteUserDB = R.invoker(0, 'destroy');

const dbMetadata = ['createdAt', 'updatedAt'];

const getAllUsers = R.pipe(
  R.always({
    attributes: {exclude: dbMetadata}
  }),
  getUsersDB,
  R.andThen(R.when(R.isEmpty, throwNotFoundError('There are no users')))
);

const getUser = userId =>
  R.pipe(
    x => ({
      where: {id: x},
      attributes: {exclude: dbMetadata}
    }),
    getUserDB,
    R.andThen(
      R.when(R.isNil, throwNotFoundError(`There are no user with id ${userId}`))
    )
  )(userId);

const setUser = (userId, objToReplace) =>
  R.pipe(
    getUser,
    R.andThen(updateUserDB(objToReplace))
  )(userId);

const deleteUser = R.pipe(
  getUser,
  R.andThen(deleteUserDB)
);

module.exports = {createUser, getAllUsers, getUser, setUser, deleteUser};
