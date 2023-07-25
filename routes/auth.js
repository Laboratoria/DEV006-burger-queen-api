const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const config = require('../config');
// eslint-disable-next-line import/extensions
const User = require('../modules/users.js');

const { secret } = config;

/** @module auth */
module.exports = (app, nextMain) => {
  /**
   * @name /auth
   * @description Crea token de autenticación.
   * @path {POST} /auth
   * @body {String} email Correo
   * @body {String} password Contraseña
   * @response {Object} resp
   * @response {String} resp.token Token a usar para los requests sucesivos
   * @code {200} si la autenticación es correcta
   * @code {400} si no se proveen `email` o `password` o ninguno de los dos
   * @auth No requiere autenticación
   */
  app.post('/auth', (req, resp, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(400);
    }

    // TODO: autenticar a la usuarix
    // Hay que confirmar si el email y password
    // coinciden con un user en la base de datos
    // Si coinciden, manda un access token creado con jwt

    User.findOne({ email }).then((user) => {
      if (user && bcrypt.compareSync(password, user.password) === true) {
        const token = jwt.sign({
          id: user._id, email: user.email, password, exp: Date.now() + 60 * 60 * 8 * 1000,
        }, secret);
        resp.status(200).json({ token });
      } else {
        next(404);
      }
    });
  });
  return nextMain();
};
