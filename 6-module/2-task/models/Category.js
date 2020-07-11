const mongoose = require('mongoose');
const connection = require('../libs/connection');

const subCategorySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
});

const categorySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },

  subcategories: [subCategorySchema],
});

categorySchema.statics.gelAll = async function() {
  const categories = await this.find({});
  return categories.map((cat) => {
    return {
      id: cat._id,
      title: cat.title,
      subcategories: cat.subcategories.map((sub) => {
        return {
          id: sub._id,
          title: sub.title,
        };
      }),
    };
  });
};

module.exports = connection.model('Category', categorySchema);
