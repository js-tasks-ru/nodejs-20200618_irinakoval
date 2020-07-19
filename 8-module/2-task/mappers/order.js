module.exports = function mapOrder(order) {
  return {
    id: order.id,
    user: order.user,
    phone: order.phone,
    address: order.address,
    product: order.product,
  };
};
