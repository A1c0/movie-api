const {Sequelize, DataTypes, Model} = require('sequelize');
const L = require('loggy-log')('sequelize');

const pino = L.getPino();
const sequelize = new Sequelize('postgres://postgres@localhost:5432/lovie', {
  logging: pino.trace,
});

sequelize
  .authenticate()
  .then(() => {})
  .catch((err) => {
    console.error('Unable to connect to the database:', err);
  });

const sequelizeOption = {
  sequelize,
  underscored: true,
  timestamps: true,
};

// Create DB Entity

class User extends Model {}
User.init(
  {
    // attributes
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    userName: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  sequelizeOption
);

class Movie extends Model {}
Movie.init(
  {
    // attributes
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    originalTitle: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    actors: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
    },
    director: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    justwatchId: {
      type: DataTypes.STRING,
      unique: true,
      validate: {
        is: /\d*/i,
      },
      allowNull: true,
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    imageUrl: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
    },
  },
  sequelizeOption
);

class Provider extends Model {}
Provider.init(
  {
    // attributes
    barcode: {
      type: DataTypes.STRING,
      validate: {
        is: /\d*/i,
      },
      primaryKey: true,
    },
    media: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    editor: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    imageUrl: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
    },
  },
  sequelizeOption
);

// Create DB Entity to make Many-to-Many

const sequelizeOption2 = {
  sequelize,
  underscored: true,
  timestamps: false,
};

class Relation extends Model {}
Relation.init({}, sequelizeOption2);

class UserProvider extends Model {}
UserProvider.init({}, sequelizeOption2);

class ProviderMovie extends Model {}
ProviderMovie.init({}, sequelizeOption2);

User.belongsToMany(User, {
  as: 'target',
  foreignKey: 'target_user_id',
  through: Relation,
});

User.belongsToMany(User, {
  as: 'source',
  foreignKey: 'source_user_id',
  through: Relation,
});

User.belongsToMany(Provider, {through: UserProvider});
Provider.belongsToMany(User, {through: UserProvider});

Provider.belongsToMany(Movie, {through: ProviderMovie});
Movie.belongsToMany(Provider, {through: ProviderMovie});

const init = async (force = false) => {
  await User.sync({force});
  await Movie.sync({force});
  await Provider.sync({force});
  await Relation.sync({force});
  await UserProvider.sync({force});
  await ProviderMovie.sync({force});
};

module.exports = {
  sequelize,
  init,
  model: {
    user: User,
    movie: Movie,
    provider: Provider,
    relation: Relation,
    userProvider: UserProvider,
    providerMovie: ProviderMovie,
  },
};

const test = async () => {
  await init();
  const u1 = await User.findByPk(1, {include: Provider});
  const p1 = await Provider.findByPk('3344428015565');
  const p2 = await Provider.findByPk('3344328015165');
  // await u1.addProvider([p2]);
  // const u1 = await User.create({
  //   firstName: 'Lorie',
  //   lastName: 'Bibabou',
  //   userName: 'Loribibabou',
  //   password: 'password',
  //   email: 'lorieBibabou@gygy.com',
  //   imageUrl: null,
  // });
};

// test();
