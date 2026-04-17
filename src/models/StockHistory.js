const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const User = require("./User");
const Item = require("./item");

const StockHistory = sequelize.define(
  "StockHistory",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    actionType: {
      type: DataTypes.ENUM("IN", "OUT", "UPDATE"),
      allowNull: false,
    },
    changedQuantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    previousQuantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    newQuantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    note: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    itemId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  {
    tableName: "stock_histories",
    timestamps: true,
  }
);

User.hasMany(StockHistory, { foreignKey: "userId", onDelete: "CASCADE" });
StockHistory.belongsTo(User, { foreignKey: "userId" });

Item.hasMany(StockHistory, { foreignKey: "itemId", onDelete: "CASCADE" });
StockHistory.belongsTo(Item, { foreignKey: "itemId" });

module.exports = StockHistory;