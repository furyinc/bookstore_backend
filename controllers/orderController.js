const Order = require('../models/order');
const Cart = require('../models/cart');
const Book = require('../models/book');

// Place an order
exports.placeOrder = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id }).populate('books.bookId');
    if (!cart || cart.books.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    let totalPrice = 0;
    cart.books.forEach(item => {
      totalPrice += item.bookId.price * item.quantity;
    });

    const newOrder = new Order({
      userId: req.user.id,
      books: cart.books,
      totalPrice,
      status: 'pending',
    });

    await newOrder.save();

    // Optionally clear the cart after placing order
    await Cart.findOneAndDelete({ userId: req.user.id });

    res.status(201).json({ message: 'Order placed successfully', order: newOrder });
  } catch (err) {
    console.error('Order placement error:', err);
    res.status(500).json({ message: 'Error placing order' });
  }
};

exports.getOrders = async (req, res) => {
  try {
    // Fetch all orders with user info and book info populated (optional)
    const orders = await Order.find()
      .populate('userId', 'name email')       // populate user basic info
      .populate('books.bookId', 'title price');  // populate book info

    res.json({ orders });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
};

// Get a specific order by ID (user or admin)
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('userId', 'name email');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check access: allow if admin or user owns the order
    if (!req.user.isAdmin && order.userId._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.status(200).json(order);
  } catch (err) {
    console.error('Get order by ID error:', err);
    res.status(500).json({ message: 'Failed to fetch order' });
  }
};

