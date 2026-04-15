const { Op } = require("sequelize");
const Item = require("../../models/item");
const Section = require("../../models/Section");
const Supplier = require("../../models/Supplier");
const sendEmail = require("../../services/sendEmail");

const createItem = async (req, res) => {
  const { itemName, quantity, price, threshold, sectionId, supplierId } = req.body;

  if (!itemName || !sectionId || !supplierId) {
    return res.status(400).json({
      success: false,
      message: "Item name, sectionId, and supplierId are required",
    });
  }

  const section = await Section.findOne({
    where: {
      id: sectionId,
      userId: req.user.id,
    },
  });

  if (!section) {
    return res.status(404).json({
      success: false,
      message: "Section not found",
    });
  }

  const supplier = await Supplier.findOne({
    where: {
      id: supplierId,
      userId: req.user.id,
    },
  });

  if (!supplier) {
    return res.status(404).json({
      success: false,
      message: "Supplier not found",
    });
  }

  const existingItem = await Item.findOne({
    where: {
      itemName,
      userId: req.user.id,
      sectionId,
    },
  });

  if (existingItem) {
    return res.status(409).json({
      success: false,
      message: "Item already exists in this section",
    });
  }

  const item = await Item.create({
    itemName,
    quantity: quantity ?? 0,
    price: price ?? 0,
    threshold: threshold ?? 5,
    sectionId,
    supplierId,
    userId: req.user.id,
  });

  return res.status(201).json({
    success: true,
    message: "Item created successfully",
    item,
  });
};

const getMyItems = async (req, res) => {
  const { search } = req.query;

  const whereCondition = {
    userId: req.user.id,
  };

  if (search) {
    whereCondition.itemName = {
      [Op.iLike]: `%${search}%`,
    };
  }

  const items = await Item.findAll({
    where: whereCondition,
    include: [
      {
        model: Section,
        attributes: ["id", "sectionName"],
      },
      {
        model: Supplier,
        attributes: ["id", "supplierName", "email", "phone"],
      },
    ],
    order: [["createdAt", "DESC"]],
  });

  return res.status(200).json({
    success: true,
    count: items.length,
    items,
  });
};

const updateItem = async (req, res) => {
  const { id } = req.params;
  const { itemName, quantity, price, threshold, sectionId, supplierId } = req.body;

  const item = await Item.findOne({
    where: {
      id,
      userId: req.user.id,
    },
    include: [
      {
        model: Supplier,
        attributes: ["id", "supplierName", "email"],
      },
      {
        model: Section,
        attributes: ["id", "sectionName"],
      },
    ],
  });

  if (!item) {
    return res.status(404).json({
      success: false,
      message: "Item not found",
    });
  }

  if (sectionId) {
    const section = await Section.findOne({
      where: {
        id: sectionId,
        userId: req.user.id,
      },
    });

    if (!section) {
      return res.status(404).json({
        success: false,
        message: "Section not found",
      });
    }

    item.sectionId = sectionId;
  }

  if (supplierId) {
    const supplier = await Supplier.findOne({
      where: {
        id: supplierId,
        userId: req.user.id,
      },
    });

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: "Supplier not found",
      });
    }

    item.supplierId = supplierId;
  }

  if (itemName) {
    item.itemName = itemName;
  }

  if (quantity !== undefined) {
    item.quantity = quantity;
  }

  if (price !== undefined) {
    item.price = price;
  }

  if (threshold !== undefined) {
    item.threshold = threshold;
  }

  // Reset flag if stock becomes normal again
  if (item.quantity > item.threshold) {
    item.lowStockEmailSent = false;
  }

  // Auto send email only once when item becomes low stock
  if (
    item.quantity <= item.threshold &&
    item.lowStockEmailSent === false &&
    item.Supplier &&
    item.Supplier.email
  ) {
    const subject = `Low Stock Alert: ${item.itemName}`;

    const text = `
Hello ${item.Supplier.supplierName || "Supplier"},

This is an automatic low stock alert from ${req.user.businessName}.

Item Name: ${item.itemName}
Section: ${item.Section ? item.Section.sectionName : "N/A"}
Current Quantity: ${item.quantity}
Threshold: ${item.threshold}

Please arrange restocking as soon as possible.

Regards,
${req.user.businessName}
`;

    await sendEmail({
      to: item.Supplier.email,
      subject,
      text,
    });

    item.lowStockEmailSent = true;
  }

  await item.save();

  return res.status(200).json({
    success: true,
    message: "Item updated successfully",
    item,
  });
};

const deleteItem = async (req, res) => {
  const { id } = req.params;

  const item = await Item.findOne({
    where: {
      id,
      userId: req.user.id,
    },
  });

  if (!item) {
    return res.status(404).json({
      success: false,
      message: "Item not found",
    });
  }

  await item.destroy();

  return res.status(200).json({
    success: true,
    message: "Item deleted successfully",
  });
};

const sendLowStockAlert = async (req, res) => {
  const { id } = req.params;

  const item = await Item.findOne({
    where: {
      id,
      userId: req.user.id,
    },
    include: [
      {
        model: Supplier,
        attributes: ["id", "supplierName", "email"],
      },
      {
        model: Section,
        attributes: ["id", "sectionName"],
      },
    ],
  });

  if (!item) {
    return res.status(404).json({
      success: false,
      message: "Item not found",
    });
  }

  if (!item.Supplier || !item.Supplier.email) {
    return res.status(400).json({
      success: false,
      message: "Supplier email not found for this item",
    });
  }

  if (item.quantity > item.threshold) {
    return res.status(400).json({
      success: false,
      message: "Item is not low in stock",
    });
  }

  const subject = `Low Stock Alert: ${item.itemName}`;

  const text = `
Hello ${item.Supplier.supplierName || "Supplier"},

This is a low stock alert from ${req.user.businessName}.

Item Name: ${item.itemName}
Section: ${item.Section ? item.Section.sectionName : "N/A"}
Current Quantity: ${item.quantity}
Threshold: ${item.threshold}

Please arrange restocking as soon as possible.

Regards,
${req.user.businessName}
`;

  await sendEmail({
    to: item.Supplier.email,
    subject,
    text,
  });

  return res.status(200).json({
    success: true,
    message: "Low stock alert email sent successfully",
  });
};
module.exports = {
  createItem,
  getMyItems,
  updateItem,
  deleteItem,
  sendLowStockAlert,
};