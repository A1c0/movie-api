'use strict';
const {DataTypes} = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define(
    'provider',
    {
      barcode: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
        unique: true,
        field: 'barcode',
      },
      medium: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'medium',
      },
      editor: {
        type: DataTypes.STRING,
        field: 'editor',
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'name',
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
    {tableName: 'providers'}
  );
};
