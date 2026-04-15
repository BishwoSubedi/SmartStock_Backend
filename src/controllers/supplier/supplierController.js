const { Op } = require("sequelize");
const Supplier = require("../../models/Supplier");

const createSupplier = async (req, res) => {
  const { supplierName, email, phone, address } = req.body;

  if (!supplierName) {
    return res.status(400).json({
      success: false,
      message: "Supplier name is required",
    });
  }

  const existingSupplier = await Supplier.findOne({
    where: {
      supplierName,
      userId: req.user.id,
    },
  });

  if (existingSupplier) {
    return res.status(409).json({
      success: false,
      message: "Supplier already exists",
    });
  }

  const supplier = await Supplier.create({
    supplierName,
    email,
    phone,
    address,
    userId: req.user.id,
  });

  return res.status(201).json({
    success: true,
    message: "Supplier created successfully",
    supplier,
  });
};

const getMySuppliers = async (req, res) => {
  const { search } = req.query;

  const whereCondition = {
    userId: req.user.id,
  };

  if (search) {
    whereCondition[Op.or] = [
      { supplierName: { [Op.iLike]: `%${search}%` } },
      { email: { [Op.iLike]: `%${search}%` } },
      { phone: { [Op.iLike]: `%${search}%` } },
    ];
  }

  const suppliers = await Supplier.findAll({
    where: whereCondition,
    order: [["createdAt", "DESC"]],
  });

  return res.status(200).json({
    success: true,
    count: suppliers.length,
    suppliers,
  });
};

const updateSupplier = async (req, res) => {
  const { id } = req.params;
  const { supplierName, email, phone, address } = req.body;

  const supplier = await Supplier.findOne({
    where: {
      id,
      userId: req.user.id,
    },
  });

  if (!supplier) {
    return res.status(404).json({
      success: false,
      message: "Supplier not found",
    });
  }

  if (supplierName) {
    const duplicateSupplier = await Supplier.findOne({
      where: {
        supplierName,
        userId: req.user.id,
      },
    });

    if (duplicateSupplier && duplicateSupplier.id !== supplier.id) {
      return res.status(409).json({
        success: false,
        message: "Supplier name already exists",
      });
    }

    supplier.supplierName = supplierName;
  }

  if (email !== undefined) {
    supplier.email = email;
  }

  if (phone !== undefined) {
    supplier.phone = phone;
  }

  if (address !== undefined) {
    supplier.address = address;
  }

  await supplier.save();

  return res.status(200).json({
    success: true,
    message: "Supplier updated successfully",
    supplier,
  });
};

const deleteSupplier = async (req, res) => {
  const { id } = req.params;

  const supplier = await Supplier.findOne({
    where: {
      id,
      userId: req.user.id,
    },
  });

  if (!supplier) {
    return res.status(404).json({
      success: false,
      message: "Supplier not found",
    });
  }

  await supplier.destroy();

  return res.status(200).json({
    success: true,
    message: "Supplier deleted successfully",
  });
};

module.exports = {
  createSupplier,
  getMySuppliers,
  updateSupplier,
  deleteSupplier,
};
  