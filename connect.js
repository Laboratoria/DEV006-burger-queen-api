const { MongoClient } = require('mongodb');
const config = require('./config');

// eslint-disable-next-line no-unused-vars
const { dbUrl } = config;
const client = new MongoClient(dbUrl);

async function connect() {
  // TODO: Conexión a la Base de Datos
  try {
    await client.connect();
    const db = client.db();
    console.log('Conexión exitosa a la base de datos',db);
    return db
    // Puedes realizar operaciones en la base de datos utilizando el objeto `db`
    // Por ejemplo: const collection = db.collection('myCollection');
  } catch (error) {
    console.error('Error al conectar a la base de datos:', error);
  }
}
module.exports = { connect };
