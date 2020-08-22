'use strict';
const {DataTypes} = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define(
    'user',
    {
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'first_name',
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'last_name',
      },
      userName: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        field: 'user_name',
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'password',
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        field: 'email',
        validate: {
          isEmail: true,
        },
      },
      imageUrl: {
        type: DataTypes.STRING,
        field: 'image_url',
      },
      createdAt: {
        type: DataTypes.DATE,
        field: 'created_at',
      },
      updatedAt: {
        type: DataTypes.DATE,
        field: 'updated_at',
      },
    },
    {tableName: 'users'}
  );
};
