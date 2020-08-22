const R = require('ramda');
const L = require('loggy-log')('sequelize');

const pino = L.getPino();

const { Sequelize } = require('sequelize');
const MovieModel = require('./models/movie.js');
const UserModel = require('./models/user.js');
const ProviderModel = require('./models/provider.js');

const sequelize = new Sequelize('postgres://postgres@localhost:5432/lovie', {
  logging: pino.trace
});

sequelize
  .authenticate()
  .then(() => {})
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

const Movie = MovieModel(sequelize);
const User = UserModel(sequelize);
const Provider = ProviderModel(sequelize);

Movie.belongsToMany(Provider, {
  through: 'provider_movies'
});

Provider.belongsToMany(Movie, {
  through: 'provider_movies'
});

User.belongsToMany(Provider, {
  through: 'user_providers'
});

Provider.belongsToMany(User, {
  through: 'user_providers'
});

User.belongsToMany(User, {
  as: 'target',
  foreignKey: 'target_user_id',
  through: 'relations'
});

User.belongsToMany(User, {
  as: 'source',
  foreignKey: 'source_user_id',
  through: 'relations'
});

module.exports = {
  sequelize,
  Sequelize,
  Movie,
  User,
  Provider
};

const test = async () => {
  await sequelize.sync();
  const u1 = await User.findByPk(1, {
    include: [
      {
        model: Provider,
        include: [Movie]
      }
    ]
  });
  const p1 = await Provider.findByPk('3344328015165');
  const m1 = await Movie.findByPk(1);
  const m2 = await Movie.findByPk(2);
  // //
  // // // const p2 = await Provider.findByPk('3344328015165');
  const linkProviderToMovies = R.curry((movies, provider) =>
    R.invoker(1, 'setMovies')(movies)(provider)
  );

  const linkProviderToUser = R.curry((provider, user) =>
    R.invoker(1, 'setProviders')(provider)(user)
  );

  const res = await linkProviderToMovies([m1, m2], p1);
  console.log(res);
  await u1.setProviders(p1);
  // const u1 = await User.create({
  //   firstName: 'Lorie',
  //   lastName: 'Bibabou',
  //   userName: 'Loribibabou',
  //   password: 'password',
  //   email: 'lorieBibabou@gygy.com',
  //   imageUrl: null
  // });
  //
  // const m2 = await Movie.create({
  //   title: 'title2',
  //   originalTitle: 'original_title2',
  //   actor: ['act1', 'act2'],
  //   director: 'director2',
  //   justwatchId: 1243,
  //   year: 2013,
  //   imageUrl: null
  // });
  //
  // const m1 = await Movie.create({
  //   title: 'title',
  //   originalTitle: 'original_title',
  //   actor: ['act1', 'act2'],
  //   director: 'director',
  //   justwatchId: 123,
  //   year: 2013,
  //   imageUrl: null
  // });
  // //
  // const p2 = await Provider.create({
  //   barcode: '3344328015165',
  //   medium: 'DVD',
  //   editor: null,
  //   name: 'Provider 2',
  //   imageUrl: null
  // });
};

test();
