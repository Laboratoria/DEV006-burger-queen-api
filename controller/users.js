// eslint-disable-next-line import/extensions
const bcrypt = require('bcrypt');
const { ObjectId } = require('mongodb');
// eslint-disable-next-line import/extensions
const User = require('../modules/users.js');
// eslint-disable-next-line import/extensions
// const isAdmin = require('../middleware/auth.js');

module.exports = {
  getUsers: async (req, resp, next) => {
    try {
      // Obtener los parámetros de consulta de página y límite
      const { page = 1, limit = 10 } = req.query;
      const pageNumber = parseInt(page, 10);
      const limitNumber = parseInt(limit, 10);

      // Calcular el número total de usuarios
      const totalUsers = await User.countDocuments();

      // Calcular el número total de páginas
      const totalPages = Math.ceil(totalUsers / limitNumber);

      // Calcular el índice de inicio y fin para la consulta
      const startIndex = (pageNumber - 1) * limitNumber;

      // Obtener la lista de usuarios paginada
      const users = await User.find({}).sort({ id: -1 }).skip(startIndex).limit(limitNumber);

      // Crear los encabezados de enlace (link headers)
      const linkHeaders = {
        first: `</users?page=1&limit=${limitNumber}>; rel="first"`,
        prev: `</users?page=${pageNumber - 1}&limit=${limitNumber}>; rel="prev"`,
        next: `</users?page=${pageNumber + 1}&limit=${limitNumber}>; rel="next"`,
        last: `</users?page=${totalPages}&limit=${limitNumber}>; rel="last"`,
      };

      // Agregar los encabezados de enlace a la respuesta
      resp.set('link', Object.values(linkHeaders).join(', '));

      // Enviar la respuesta con la lista de usuarios
      resp.send(users);
    } catch (err) {
      /* console.log("mostrar error al traer usuarios de la colección", err); */
      next(err);
    }
  },

  getUserByIdOrEmail: async (req, resp, next) => {
    const { uid } = req.params;
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(uid);
    let filter;

    if (isObjectId) {
      filter = { _id: new ObjectId(uid) };
    } else {
      filter = { email: uid.toLowerCase() };
    }

    try {
      const isAdmin = req.isAdmin === true;
      const authorizedUser = req.user.id === uid || isAdmin || req.user.email === uid;

      if (!authorizedUser) {
        return next(403);
      }

      const user = await User.findOne(filter);

      if (user) {
        resp.status(200).json({
          id: user._id,
          email: user.email,
          role: user.role,
        });
      } else {
        return resp.status(404).json({
          error: 'User not found',
        });
      }
    } catch (error) {
      console.error(error);
      resp.status(500).json({
        error: 'Server error',
      });
    }
  },

  createUser: async (req, resp, next) => {
    const { email, password, role } = req.body;
    if (!email || !password || !role) {
      return next(400);
    }

    try {
      const isAdmin = req.isAdmin === true;
      const authorizedUser = req.user.role === 'admin' || isAdmin;

      if (!authorizedUser) {
        return resp.status(403).json({
          error: 'You are not authorized to create a new user',
        });
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return resp.status(403).json({
          error: 'User exists',
        });
      }

      const newUser = new User({
        email,
        password: bcrypt.hashSync(password, 10),
        role,
      });

      const insertedUser = await newUser.save();
      resp.status(200).json({
        id: insertedUser._id,
        email,
        role,
      });
    } catch (err) {
      console.error(err);
      resp.status(500).json({
        error: 'Server error',
      });
    }
  },
};
