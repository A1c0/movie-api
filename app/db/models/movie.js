'use strict';
const {DataTypes} = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define(
    'movie',
    {
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        field: 'title',
      },
      originalTitle: {
        type: DataTypes.STRING,
        field: 'original_title',
      },
      actor: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        field: 'actor',
      },
      director: {
        type: DataTypes.STRING,
        field: 'director',
      },
      justwatchId: {
        type: DataTypes.INTEGER,
        unique: true,
        field: 'justwatch_id',
      },
      year: {
        type: DataTypes.INTEGER,
        field: 'year',
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
    {tableName: 'movies'}
  );
};
