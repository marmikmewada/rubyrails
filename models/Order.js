const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  product: { // Change 'products' to 'product'
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['processed', 'shipped', 'delivered'],
    default: 'processed'
  }
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
