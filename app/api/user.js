const R = require('ramda');

const {User} = require('../db/index');
const {throwNotFoundError} = require('./error');
const {formatNotFountMessage, dbMetadata} = require('../../lib/db-utils');

const createUserDB = R.bind(User.create, User);
const getUsersDB = R.bind(User.findAll, User);
const getUserDB = R.bind(User.findOne, User);
const createUser = createUserDB;

const updateUserDB = R.invoker(1, 'update');
const deleteUserDB = R.invoker(0, 'destroy');

const getAllUsers = R.pipe(
  R.always({
    attributes: {exclude: dbMetadata}
  }),
  getUsersDB,
  R.andThen(R.when(R.isEmpty, throwNotFoundError('There are no users')))
);

const getUser = userObjProp =>
  R.pipe(
    x => ({
      where: x,
      attributes: {exclude: dbMetadata}
    }),
    getUserDB,
    R.andThen(
      R.when(
        R.isNil,
        throwNotFoundError(
          `There are no user with id ${formatNotFountMessage(userObjProp)}`
        )
      )
    )
  )(userObjProp);

const setUser = (userId, objToReplace) =>
  R.pipe(getUser, R.andThen(updateUserDB(objToReplace)))(userId);

const deleteUser = R.pipe(getUser, R.andThen(deleteUserDB));

module.exports = {createUser, getAllUsers, getUser, setUser, deleteUser};
