const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  books: [{
    bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
    quantity: { type: Number, required: true }
  }],
  totalPrice: { type: Number, required: true },
  status: { type: String, default: 'pending' },
}, { timestamps: true });

module.exports = mongoose.models.Order || mongoose.model('Order', orderSchema);
