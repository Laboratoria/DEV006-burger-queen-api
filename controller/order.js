// eslint-disable-next-line import/extensions
const Order = require('../modules/order.js');

module.exports = {
  createOrder: async (req, resp, next) => {
    const { client, products, status } = req.body;

    // eslint-disable-next-line no-console
    if ((!client && !products) || products.lenght === 0) {
      return resp.status(400).json({
        error: 'userId and products are needed to create the order',
      });
    }
    const productsOrder = products.map((product) => ({
      qty: product.qty,
      product: product.product,
    }));

    const newOrder = new Order({
      client,
      products: productsOrder,
      status,
      dateEntry: new Date(),
      dateProcessed: new Date(),
    });

    try {
      const savedOrder = await newOrder.save();

      resp.status(200).json(savedOrder);
    } catch (error) {
      next(error);
    }
  },
  getOrders: async (resp, next) => {
    try {
      const orders = await Order.find();
      resp.status(200).json(orders);
    } catch (error) {
      next(404);
    }
  },
  getOrderById: async (req, resp, next) => {
    const { orderId } = req.params;
    try {
      const order = await Order.findById(orderId);
      if (order) {
        resp.status(200).json(order);
      }
    } catch (error) {
      next(404);
    }
  },
  updateOrder: async (req, resp, next) => {
    const { orderId } = req.params;
    const { status } = req.body;
    const allowedStatus = ['pending', 'canceled', 'delivering', 'delivered'];

    const isAdmin = req.user.role === 'admin';

    if (!isAdmin) {
      return resp.status(403).json({
        error: 'You are not authorized because you are not an administrator',
      });
    }

    let updatedOrder;

    try {
      const order = await Order.findById(orderId);
      if (!order) {
        resp.status(404).json({
          error: 'Does not exist',
        });
      }
      if (!status || !allowedStatus.includes(status)) {
        resp.status(400).json({
          error: 'Its not valid',
        });
      }
      if (status === 'delivered' && status === 'canceled' && status === 'delivering') {
        updatedOrder = await Order.findByIdAndUpdate(
          orderId,
          { status, dateProcessed: new Date() },
          { new: true },
        );
      }
      updatedOrder = await Order.findByIdAndUpdate(
        orderId,
        { status },
        { new: true },
      );
      resp.status(200).json(updatedOrder);
    } catch (error) {
      next(404);
    }
  },
  deleteOrder: async (req, resp, next) => {
    const { orderId } = req.params;

    try {
      const deleteOrder = await Order.findByIdAndDelete(orderId);
      resp.status(200).json({
        deleteOrder,
        Message: 'Removed',
      });
    } catch (error) {
      next(404);
    }
  },
};
