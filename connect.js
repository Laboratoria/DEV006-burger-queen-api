const mongoose = require('mongoose');
const config = require('./config');

// eslint-disable-next-line no-unused-vars
const { dbUrl } = config;

async function connect() {
  try {
    // eslint-disable-next-line no-console
    console.log('conectando bd');
    await mongoose.connect(dbUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    // eslint-disable-next-line no-console
    console.log('successful connection ');
  } catch (error) {
    console.error(`${error}Failed to connect`);
  }
}

module.exports = { connect };
