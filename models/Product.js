const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  categories: [{
    type: String
  }],
  imageUrl: {
    type: String
  },
  isFeatured: {
    type: Boolean,
    default: false
  }
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
