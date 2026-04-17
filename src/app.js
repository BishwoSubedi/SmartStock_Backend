const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/auth/authRoutes");
const sectionRoutes = require("./routes/section/sectionRoutes");
const supplierRoutes = require("./routes/supplier/supplierRoutes");
const itemRoutes = require("./routes/item/itemRoute");
const dashboardRoutes = require("./routes/dashboard/dashboardRoute");
const stockHistoryRoutes = require("./routes/stockHistory/stockHistoryRoute");
const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("SmartStock API is running");
});

app.use("/api/auth", authRoutes);
app.use("/api/sections", sectionRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/stock-history", stockHistoryRoutes);
module.exports = app;