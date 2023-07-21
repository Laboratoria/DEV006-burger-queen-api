const config = require('./config');
const mongoose = require('mongoose');

// eslint-disable-next-line no-unused-vars
const { dbUrl } = config;

async function connect() {
  try{
    console.log('conectando bd')
    await mongoose.connect(dbUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('successful connection ');
  }catch (error) {
    console.error(error + 'Failed to connect');
  }
}

module.exports = { connect };