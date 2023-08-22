const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: {
    type: String,
  },
  client: {
    type: String,
  },
  products: [
    {
      qty: {
        type: Number,
        default: 1,
      },
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        require: true,
      },
      _id: false,
    },
  ],
  status: {
    type: String,
    enum: ['pending', 'canceled', 'delivering', 'delivered'],
    default: 'pending',
  },
  dataEntry: {
    type: Date,
  },
  dataProcessed: {
    type: Date,
  },
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
