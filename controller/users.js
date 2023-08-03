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
};
