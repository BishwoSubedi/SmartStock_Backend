const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const User = require("./User");
const Section = require("./Section");
const Supplier = require("./Supplier");

const Item = sequelize.define(
  "Item",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    itemName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    threshold: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 5,
    },
    lowStockEmailSent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    sectionId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    supplierId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  {
    tableName: "items",
    timestamps: true,
  },
);

User.hasMany(Item, { foreignKey: "userId", onDelete: "CASCADE" });
Item.belongsTo(User, { foreignKey: "userId" });

Section.hasMany(Item, { foreignKey: "sectionId", onDelete: "CASCADE" });
Item.belongsTo(Section, { foreignKey: "sectionId" });

Supplier.hasMany(Item, { foreignKey: "supplierId", onDelete: "CASCADE" });
Item.belongsTo(Supplier, { foreignKey: "supplierId" });

module.exports = Item;
