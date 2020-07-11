const mongoose = require('mongoose');
const connection = require('../libs/connection');
const ObjectId = mongoose.Types.ObjectId;

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },

  description: {
    type: String,
    required: true,
  },

  price: {
    type: Number,
    required: true,
  },

  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },

  subcategory: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },

  images: [String],

});

productSchema.statics.getProducts = async function() {
  const products = await this.find({});
  return !products ? [] : products.map((product) => {
    return {
      id: product._id,
      title: product.title,
      images: product.images,
      price: product.price,
      description: product.description,
      category: product.category,
      subcategory: product.subcategory,
    };
  });
};

productSchema.statics.getProductsBySubcategory = async function(subcategory) {
  const products = await this.find({subcategory: new ObjectId(subcategory)});
  return !products ? [] : products.map((product) => {
    return {
      id: product._id,
      title: product.title,
      images: product.images,
      price: product.price,
      description: product.description,
      category: product.category,
      subcategory: product.subcategory,
    };
  });
};

productSchema.statics.getProductsById = async function(id) {
  const product = await this.findOne({_id: id});
  return !product ? null : {
    id: product._id,
    title: product.title,
    images: product.images,
    price: product.price,
    description: product.description,
    category: product.category,
    subcategory: product.subcategory,
  };
};

module.exports = connection.model('Product', productSchema);
