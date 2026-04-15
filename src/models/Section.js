const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const User = require("./User");

const Section = sequelize.define(
  "Section",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    sectionName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  {
    tableName: "sections",
    timestamps: true,
  }
);

User.hasMany(Section, { foreignKey: "userId", onDelete: "CASCADE" });
Section.belongsTo(User, { foreignKey: "userId" });

module.exports = Section;