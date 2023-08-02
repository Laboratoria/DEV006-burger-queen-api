/* eslint-disable no-unused-vars */

const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const config = require('../config');

const { dbUrl, secret } = config;

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
  app.post('/auth', async (req, resp, next) => {
    if (!req.body.email || !req.body.password) {
      return next(400);
    }

    try {
      const client = new MongoClient(dbUrl);
      await client.connect();
      const db = client.db();
      const collection = db.collection('users');
      const user = await collection.findOne({ email: req.body.email });
      if (!user) {
        resp.send('Invalid Email or Password.');
      }
      const validPassword = await bcrypt.compare(req.body.password, user.password);
      if (!validPassword) resp.send('Invalid Email or Password.');
      const accessToken = jwt.sign({ userId: user._id, rol: user.role, email: user.email }, secret);
      resp.status(200).json({ accessToken });
    } catch (err) {
      /* d */
    }

    // TODO: autenticar a la usuarix
    // Hay que confirmar si el email y password
    // coinciden con un user en la base de datos
    // Si coinciden, manda un access token creado con jwt
    next();
  });

  return nextMain();
};
