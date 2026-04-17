const StockHistory = require("../../models/StockHistory");
const Item = require("../../models/item");

const getMyStockHistory = async (req, res) => {
  const history = await StockHistory.findAll({
    where: { userId: req.user.id },
    include: [
      {
        model: Item,
        attributes: ["id", "itemName"],
      },
    ],
    order: [["createdAt", "DESC"]],
  });

  return res.status(200).json({
    success: true,
    count: history.length,
    history,
  });
};

module.exports = {
  getMyStockHistory,
};