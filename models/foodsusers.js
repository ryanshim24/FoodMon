"use strict";

module.exports = function(sequelize, DataTypes) {
  var FoodsUsers = sequelize.define("FoodsUsers", {
    FoodId: DataTypes.INTEGER,
    UserId: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(models) {
        FoodsUsers.belongsTo(models.Food);
        FoodsUsers.belongsTo(models.User);
      }
    }
  });

  return FoodsUsers;
};
