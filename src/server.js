const app = require("./app");
const sequelize = require("./config/db");
require("dotenv").config();
require("./models/User");
require("./models/Section");
require("./models/Supplier");
require("./models/item");

const PORT = process.env.PORT || 5000;

sequelize
  .authenticate()
  .then(() => {
    console.log("PostgreSQL connected successfully");
    return sequelize.sync({ force: false });
  })
  .then(() => {
    console.log("Models synced successfully");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Database connection failed:", error.message);
  });