/* eslint-disable no-unused-vars */
const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');
const config = require('../config');

const { dbUrl } = config;

module.exports = {
  getUsers: async (req, resp, next) => {
    try {
      const client = new MongoClient(dbUrl);
      await client.connect();
      const db = client.db();
      const collection = db.collection('users');
      const usuarios = await collection.find({}).toArray();
      resp.send(usuarios);
    } catch (error) {
      /* h */
    }
    // TODO: Implementa la función necesaria para traer la colección `users`
    next();
  },
  postUser: async (req, resp, next) => {
    const credentials = {
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 10),
      rol: req.body.rol,
    };

    try {
      const client = new MongoClient(dbUrl);
      await client.connect();
      const db = client.db();
      const collection = db.collection('users');
      const user = await collection.findOne({ email: req.body.email });
      if (!user) {
        await collection.insertOne(credentials);
        resp.send('se agrego nuevo usuario');
      } else {
        resp.send('ya existe el usuario');
      }
    } catch (error) {
      /*  */
    }
    next();
  },
};
