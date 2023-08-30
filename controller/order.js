// eslint-disable-next-line import/extensions
const Order = require('../modules/order.js');

module.exports = {
  getOrders: async (req, resp, next) => {
    try {
      const orders = await Order.find();
      resp.status(200).json(orders);
    } catch (error) {
      next(404);
    }
  },
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
      console.log(error);    
    }
  },
};
