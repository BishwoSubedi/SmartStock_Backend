const Item = require("../../models/item");
const Section = require("../../models/Section");
const Supplier = require("../../models/Supplier");
const { Op, col, where } = require("sequelize");

const getDashboardStats = async (req, res) => {
  const userId = req.user.id;

  const totalSections = await Section.count({
    where: { userId },
  });

  const totalSuppliers = await Supplier.count({
    where: { userId },
  });

  const totalItems = await Item.count({
    where: { userId },
  });

  const lowStockItems = await Item.count({
    where: {
      userId,
      [Op.and]: [where(col("quantity"), "<=", col("threshold"))],
    },
  });

  return res.status(200).json({
    success: true,
    stats: {
      totalSections,
      totalSuppliers,
      totalItems,
      lowStockItems,
    },
  });
};

const getLowStockItems = async (req, res) => {
  const userId = req.user.id;
  const { search } = req.query;

  const whereCondition = {
    userId,
    [Op.and]: [where(col("quantity"), "<=", col("threshold"))],
  };

  if (search) {
    whereCondition.itemName = {
      [Op.iLike]: `%${search}%`,
    };
  }

  const items = await Item.findAll({
    where: whereCondition,
    order: [["createdAt", "DESC"]],
  });

  return res.status(200).json({
    success: true,
    count: items.length,
    items,
  });
};

module.exports = {
  getDashboardStats,
  getLowStockItems,
};




