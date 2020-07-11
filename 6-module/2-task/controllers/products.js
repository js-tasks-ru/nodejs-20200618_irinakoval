const Product = require('../models/Product');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

module.exports.productsBySubcategory = async function productsBySubcategory(ctx, next) {
  if (ctx.query.subcategory) {
    const products = await Product.getProductsBySubcategory(ctx.query.subcategory);
    ctx.body = {products};
    return;
  }
  await next();
};

module.exports.productList = async function productList(ctx, next) {
  const products = await Product.getProducts();
  ctx.body = {products: products};
};

module.exports.productById = async function productById(ctx, next) {
  let id;
  try {
    id = new ObjectId(ctx.params.id);
  } catch (e) {
    ctx.status = 400;
    ctx.body = {error: 'Invalid id'};
    return;
  }

  const product = await Product.getProductsById(id);
  if (!product) {
    ctx.status = 404;
    ctx.body = {error: 'Not Found'};
    return;
  }
  ctx.body = {product: product};

};

