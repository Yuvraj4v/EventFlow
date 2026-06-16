// ============================================================
// Category Controller
// ============================================================
const Category = require('../models/Category');
const Event = require('../models/Event');

exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true }).sort('order name');
    
    // Add event count to each category
    const categoriesWithCount = await Promise.all(
      categories.map(async (cat) => {
        const count = await Event.countDocuments({ category: cat._id, status: 'published' });
        return { ...cat.toJSON(), eventCount: count };
      })
    );

    res.json({ success: true, data: categoriesWithCount });
  } catch (error) {
    next(error);
  }
};

exports.getCategory = async (req, res, next) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug });
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

exports.createCategory = async (req, res, next) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json({ success: true, message: 'Category created', data: category });
  } catch (error) {
    next(error);
  }
};

exports.updateCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

exports.deleteCategory = async (req, res, next) => {
  try {
    const eventCount = await Event.countDocuments({ category: req.params.id });
    if (eventCount > 0) {
      return res.status(400).json({ success: false, message: `Cannot delete: ${eventCount} events use this category` });
    }
    await Category.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Category deleted' });
  } catch (error) {
    next(error);
  }
};
