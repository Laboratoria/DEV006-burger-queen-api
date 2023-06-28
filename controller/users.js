const { MongoClient } = require('mongodb');
const config = require('../config');

const { dbUrl } = config;
const client = new MongoClient(dbUrl);

module.exports = {
  getUsers: async (req, resp, next) => {
    try {
      await client.connect();
      const db = client.db();
      const collection = db.collection('users');
      const users = await collection.find({}).toArray();
      resp.send(users);
    } catch (err) {
      console.log("mostrar error al traer usuarios de la colección", err);
      next(err);
    } finally {
      client.close();
    }
  },
};
