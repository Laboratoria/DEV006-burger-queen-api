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
      const totalUsers = await User.countDocuments();

      // Calcular el número total de páginas
      const totalPages = Math.ceil(totalUsers / limitNumber);

      // Calcular el índice de inicio y fin para la consulta
      const startIndex = (pageNumber - 1) * limitNumber;

      // Obtener la lista de usuarios paginada
      const users = await User.find({})
        .sort({ id: -1 })
        .skip(startIndex)
        .limit(limitNumber)
        .select('-__v');

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
    // Se crea un objeto filter para usar en la búsqueda del usuario en la base de datos.
    // Si uid es un ObjectId, el filtro se establece para buscar por _id.
    // Si no, se buscará por email.

    if (isObjectId) {
      filter = { _id: new ObjectId(uid) };
    } else {
      filter = { email: uid.toLowerCase() };
    }

    try {
      // Verificar si el token pertenece a una usuaria administradora
      const isAdmin = req.isAdmin === true;
      // Verificar si el token pertenece a la misma usuaria o si es una usuaria administradora
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
    // Verificar si el token pertenece a una usuaria administradora
    try {
    // Verificar si el usuario que realiza la solicitud tiene el rol de administrador
      const authorizedUser = req.user.role === 'admin';

      if (!authorizedUser) {
        return resp.status(403).json({
          error: 'You are not authorized to create a new user',
        });
      }
      // Verificar si ya existe una usuaria con el mismo email
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return resp.status(403).json({
          error: 'User exists',
        });
      }
      // Si el usuario está autorizado y no existe un usuario con el mismo email,
      // crear un nuevo usuario
      const newUser = new User({
        email,
        password: bcrypt.hashSync(password, 10),
        role,
      });
      // Guardar el nuevo usuario en la base de datos
      const insertedUser = await newUser.save();
      // Devolver una respuesta exitosa con la información del usuario creado
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

  updateUserInformation: async (req, resp, next) => {
    const { uid } = req.params;
    const { email, password, role } = req.body;
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(uid);
    let filteredUser;

    if (isObjectId) {
      filteredUser = { _id: uid };
    } else {
      filteredUser = { email: uid.toLowerCase() };
    }

    try {
      const authorizedUser = (req.user.role === 'admin') || (req.user === uid || req.user.email === uid);

      if (!authorizedUser) {
        return resp.status(403).json({
          error: 'You are not authorized to modify this user',
        });
      }
      const user = await User.findOne(filteredUser).exec();
      if (req.user.role !== 'admin' && (role && role !== user.role)) {
        return next(403).json({
          error: 'You are not allowed to change the user role',
        });
      }
      if (password) {
        const hashedPassword = bcrypt.hashSync(password, 10);
        const updateUser = await User.updateOne(filteredUser, { email, password: hashedPassword, role }, { new: true, select: '_id email role' });
        return resp.status(200).json(updateUser);
      }
    } catch (error) {
      resp.status(404).json({
        error: 'User not found',
      });
    }
  },

  deleteUser: async (req, resp, next) => {
    const { uid } = req.params;
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(uid);
    let filteredUser;

    if (isObjectId) {
      filteredUser = { _id: uid };
    } else {
      filteredUser = { email: uid.toLowerCase() };
    }

    try {
      const authorizedUser = (req.user.role === 'admin') || (req.user === uid || req.user.email === uid);

      if (!authorizedUser) {
        return resp.status(403).json({
          error: 'You do not have authorization to delete this user',
        });
      }
      const dropUser = await User.deleteOne(filteredUser).exec();
      if (dropUser) {
        return resp.status(200).json({
          id: dropUser._id,
          email: dropUser.email,
          role: dropUser.role,
        });
      }
    } catch (error) {
      return next(404).json({
        error: 'User not found',
      });
    }
  },
};
