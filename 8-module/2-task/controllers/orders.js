const Order = require('../models/Order');
const sendMail = require('../libs/sendMail');
const mapOrders = require('../mappers/order');

module.exports.checkout = async function checkout(ctx, next) {
  const {user} = ctx;
  if (!user) {
    ctx.status = 401;
    ctx.body = {error: 'not authorized'};
    return;
  }

  const {product, phone, address} = ctx.request.body;
  const order = new Order({
    product,
    phone,
    address,
    user: ctx.user,
  });
  await order.save();
  await order.populate('product').execPopulate();

  await sendMail({
    to: ctx.user.email,
    subject: 'Подтвердите почту',
    locals: {id: order.id, product: order.product},
    template: 'order-confirmation',
  });

  ctx.body = {order: order.id};
};

module.exports.getOrdersList = async function ordersList(ctx, next) {
  try {
    const {user} = ctx;
    if (!user) {
      ctx.status = 401;
      ctx.body = {error: 'not authorized'};
      return;
    }

    const orders = await Order.find({user}).populate('user').populate('product');
    ctx.body = {orders: orders.map(mapOrders)};
  } catch (e) {
    ctx.status = 400;
    ctx.body = {error: e.message};
  }
};
