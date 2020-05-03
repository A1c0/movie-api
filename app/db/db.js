const {Sequelize, DataTypes, Model} = require('sequelize');
const L = require('loggy-log')('sequelize');

const pino = L.getPino();
const sequelize = new Sequelize('postgres://postgres@localhost:5432/lovie', {
  logging: pino.trace
});
sequelize
  .authenticate()
  .then(() => {})
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

const sequelizeOption = {
  sequelize,
  underscored: true,
  timestamps: true
};

// Create DB Entity

class User extends Model {}
User.init(
  {
    // attributes
    firstName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    userName: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: true
    }
  },
  sequelizeOption
);

class Movie extends Model {}
Movie.init(
  {
    // attributes
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    titleVo: {
      type: DataTypes.STRING,
      allowNull: true
    },
    actors: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
      unique: true
    },
    director: {
      type: DataTypes.STRING,
      allowNull: true
    },
    type: {
      type: DataTypes.STRING,
      allowNull: true
    },
    imageUrl: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true
    }
  },
  sequelizeOption
);

class Provider extends Model {}
Provider.init(
  {
    // attributes
    media: {
      type: DataTypes.STRING,
      allowNull: false
    },
    editor: {
      type: DataTypes.STRING,
      allowNull: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    imageUrl: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true
    }
  },
  sequelizeOption
);

// Create DB Entity to make Many-to-Many

const sequelizeOption2 = {
  sequelize,
  underscored: true,
  timestamps: false
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
  through: Relation
});

User.belongsToMany(User, {
  as: 'source',
  foreignKey: 'source_user_id',
  through: Relation
});

User.belongsToMany(Provider, {through: UserProvider});
Provider.belongsToMany(User, {through: UserProvider});

Provider.belongsToMany(Movie, {through: ProviderMovie});
Movie.belongsToMany(Provider, {through: ProviderMovie});

const init = async () => {
  await User.sync();
  await Movie.sync();
  await Provider.sync();
  await Relation.sync();
  await UserProvider.sync();
  await ProviderMovie.sync();
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
    providerMovie: ProviderMovie
  }
};
