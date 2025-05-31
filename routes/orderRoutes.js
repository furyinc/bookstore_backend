const express = require('express');
const { placeOrder, getOrders, getOrderById } = require('../controllers/orderController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// POST /api/orders - place a new order
router.post('/', authMiddleware, placeOrder);

// GET /api/orders - get all orders (admin only)
router.get('/', authMiddleware, adminMiddleware, getOrders);

// GET /api/orders/:id - get specific order by ID (user or admin)
router.get('/:id', authMiddleware, getOrderById);

module.exports = router;

