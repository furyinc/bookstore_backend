const express = require('express');
const { addToCart, getCart, removeFromCart, clearCart } = require('../controllers/cartController');
const { authMiddleware } = require('../middleware/auth'); // Changed this line

const router = express.Router();

// Route to add book to cart
router.post('/', authMiddleware, addToCart); // Changed to authMiddleware

// Route to fetch the cart
router.get('/', authMiddleware, getCart); // Changed to authMiddleware

// Add this route
router.delete('/:bookId', authMiddleware, removeFromCart);

// In routes
router.delete('/', authMiddleware, clearCart);

module.exports = router;
