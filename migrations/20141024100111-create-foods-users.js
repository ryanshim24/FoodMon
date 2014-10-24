"use strict";
module.exports = {
  up: function(migration, DataTypes, done) {
    migration.createTable("FoodsUsers", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      FoodId: {
        type: DataTypes.INTEGER,
        references: "Foods",
        referencesKey: "id"
      },
      UserId: {
        type: DataTypes.INTEGER,
        references: "Users",
        referencesKey: "id"
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE
      }
    }).done(done);
  },
  down: function(migration, DataTypes, done) {
    migration.dropTable("FoodsUsers").done(done);
  }
};