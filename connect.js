const { MongoClient } = require('mongodb');
const config = require('./config');

const { dbUrl } = config;
const client = new MongoClient(dbUrl);

async function connect() {
  // TODO: Conexión a la Base de Datos
  try {
    await client.connect();
    const db = client.db();
    return db;
  } catch (error) {
    console.error('Error en connect.js');
  }
}
module.exports = { connect };
