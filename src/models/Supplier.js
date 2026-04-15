const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const User = require("./User");

const Supplier = sequelize.define(
  "Supplier",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    supplierName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isEmail: true,
      },
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  {
    tableName: "suppliers",
    timestamps: true,
  }
);

User.hasMany(Supplier, { foreignKey: "userId", onDelete: "CASCADE" });
Supplier.belongsTo(User, { foreignKey: "userId" });

module.exports = Supplier;