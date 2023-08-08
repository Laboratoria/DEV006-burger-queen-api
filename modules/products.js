const mongoose = require('mongoose');

const { Schema } = mongoose;

const productsSchema = new Schema({
  name: {
    type: String,
    require: true,
    unique: true, // El nombre debe ser único
    lowecase: true, // Convertir el nombre a minúsculas
    trim: true, // Eliminar espacios en blanco al principio y al final
  },
  price: {
    type: Number,
    require: true, // El precio es obligatorio
    default: 0,
  },
  // URL de la imagen del producto
  Image: {
    type: String,
    default: '',
  },
  // URL de la imagen del producto
  type: {
    type: String,
    default: '',
  },
  // Fecha de entrada del producto
  dataEntry: {
    type: String,
  },
});

const Products = mongoose.model('products', productsSchema);
module.exports = Products;
