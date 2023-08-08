// eslint-disable-next-line import/extensions
const Products = require('../modules/products.js');

module.exports = {
  createProducts: async (req, resp, next) => {
    const { name, price } = req.body;

    if (!name || !price) {
      return resp.status(400).json({
        error: 'Inputs should not be empty',
      });
    }

    const isAdmin = req.user.role === 'admin';

    if (!isAdmin) {
      return resp.status(403).json({
        error: 'You are not authorized because you are not an administrator user',
      });
    }
    try {
      const newProduct = await Products.create({
        name,
        price,
        image: req.body.image,
        type: req.body.type,
        dataEntry: new Date(),
      });
      const result = await newProduct.save();
      return resp.status(200).json({
        id: result.insertedId,
        name: newProduct.name,
        price: newProduct.price,
        image: newProduct.image,
        type: newProduct.type,
        dataEntry: newProduct.dataEntry,
      });
    } catch (error) {
      next(error);
    }
  },
};
