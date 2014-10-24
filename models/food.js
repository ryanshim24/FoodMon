"use strict";

module.exports = function(sequelize, DataTypes) {
  var Food = sequelize.define("Food", {
    recipe: DataTypes.TEXT
  }, {
    classMethods: {
      associate: function(models) {
        Food.hasMany(models.User,{onDelete: "NO ACTION"});
      }
    }
  });

  return Food;
};
