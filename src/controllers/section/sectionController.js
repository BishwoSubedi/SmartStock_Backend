const { Op } = require("sequelize");
const Section = require("../../models/Section");

const createSection = async (req, res) => {
  const { sectionName, description } = req.body;

  if (!sectionName) {
    return res.status(400).json({
      success: false,
      message: "Section name is required",
    });
  }

  const existingSection = await Section.findOne({
    where: {
      sectionName,
      userId: req.user.id,
    },
  });

  if (existingSection) {
    return res.status(409).json({
      success: false,
      message: "Section already exists",
    });
  }

  const section = await Section.create({
    sectionName,
    description,
    userId: req.user.id,
  });

  return res.status(201).json({
    success: true,
    message: "Section created successfully",
    section,
  });
};

const getMySections = async (req, res) => {
  const { search } = req.query;

  const whereCondition = {
    userId: req.user.id,
  };

  if (search) {
    whereCondition.sectionName = {
      [Op.iLike]: `%${search}%`,
    };
  }

  const sections = await Section.findAll({
    where: whereCondition,
    order: [["createdAt", "DESC"]],
  });

  return res.status(200).json({
    success: true,
    count: sections.length,
    sections,
  });
};

const updateSection = async (req, res) => {
  const { id } = req.params;
  const { sectionName, description } = req.body;

  const section = await Section.findOne({
    where: {
      id,
      userId: req.user.id,
    },
  });

  if (!section) {
    return res.status(404).json({
      success: false,
      message: "Section not found",
    });
  }

  if (sectionName) {
    const duplicateSection = await Section.findOne({
      where: {
        sectionName,
        userId: req.user.id,
      },
    });

    if (duplicateSection && duplicateSection.id !== section.id) {
      return res.status(409).json({
        success: false,
        message: "Section name already exists",
      });
    }

    section.sectionName = sectionName;
  }

  if (description !== undefined) {
    section.description = description;
  }

  await section.save();

  return res.status(200).json({
    success: true,
    message: "Section updated successfully",
    section,
  });
};

const deleteSection = async (req, res) => {
  const { id } = req.params;

  const section = await Section.findOne({
    where: {
      id,
      userId: req.user.id,
    },
  });

  if (!section) {
    return res.status(404).json({
      success: false,
      message: "Section not found",
    });
  }

  await section.destroy();

  return res.status(200).json({
    success: true,
    message: "Section deleted successfully",
  });
};

module.exports = {
  createSection,
  getMySections,
  updateSection,
  deleteSection,
}; 