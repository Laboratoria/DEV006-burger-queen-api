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
        image: newProduct.Image,
        type: newProduct.type,
        dataEntry: newProduct.dataEntry,
      });
    } catch (error) {
      next(error);
    }
  },

  getProductsCollection: async (req, resp, next) => {
    try {
      // Obtener los parámetros de consulta de página y límite
      const { page = 1, limit = 10 } = req.query;
      const pageNumber = parseInt(page, 10);
      const limitNumber = parseInt(limit, 10);
      const totalUsers = await Products.countDocuments();

      // Calcular el número total de páginas
      const totalPages = Math.ceil(totalUsers / limitNumber);

      // Calcular el índice de inicio y fin para la consulta
      const startIndex = (pageNumber - 1) * limitNumber;

      // Obtener la lista de productos paginada
      const products = await Products.find({})
        .sort({ id: -1 })
        .skip(startIndex)
        .limit(limitNumber)
        .select('-__v'); // Vamos a ocultar el control de version de documentos

      // Crear los encabezados de enlace (link headers)
      const linkHeaders = {
        first: `</users?page=1&limit=${limitNumber}>; rel="first"`,
        prev: `</users?page=${pageNumber - 1}&limit=${limitNumber}>; rel="prev"`,
        next: `</users?page=${pageNumber + 1}&limit=${limitNumber}>; rel="next"`,
        last: `</users?page=${totalPages}&limit=${limitNumber}>; rel="last"`,
      };

      // Agregar los encabezados de enlace a la respuesta
      resp.set('link', Object.values(linkHeaders).join(', '));

      // Enviar la respuesta con la lista de productos
      resp.send(products);
    } catch (err) {
      next(err);
    }
  },

  getProductById: async (req, resp, next) => {
    const { productId } = req.params;
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(productId);
    let filter;

    if (isObjectId) {
      filter = { _id: productId };
    }

    try {
      const product = await Products.findOne(filter);

      if (product) {
        resp.status(200).json({
          id: product._id,
          name: product.name,
          price: product.price,
          image: product.image,
          type: product.type,
          dataEntry: product.dataEntry,
        });
      } else {
        return resp.status(404).json({
          error: 'Product not found',
        });
      }
    } catch (error) {
      console.error(error);
      resp.status(500).json({
        error: 'Server error',
      });
    }
  },

};
