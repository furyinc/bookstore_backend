// const Cart = require('../models/cart');
// const Book = require('../models/book');
// const cloudinary = require('cloudinary').v2;

// // Configure Cloudinary (ensure this matches your cloudinary.js config)
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET
// });

// // Add book to cart
// exports.addToCart = async (req, res) => {
//   const { bookId, quantity } = req.body;

//   try {
//     // Validate book exists
//     const book = await Book.findById(bookId);
//     if (!book) {
//       return res.status(404).json({ message: 'Book not found' });
//     }

//     // Find or create user's cart
//     let cart = await Cart.findOne({ userId: req.user.id });

//     if (cart) {
//       // Update existing item or add new one
//       const existingItem = cart.books.find(item => 
//         item.bookId.toString() === bookId
//       );
      
//       if (existingItem) {
//         existingItem.quantity += quantity;
//       } else {
//         cart.books.push({ bookId, quantity });
//       }
//     } else {
//       // Create new cart
//       cart = new Cart({ 
//         userId: req.user.id,
//         books: [{ bookId, quantity }] 
//       });
//     }

//     await cart.save();
//     res.status(200).json({ message: 'Book added to cart', cart });
//   } catch (err) {
//     console.error('Error adding to cart:', err);
//     res.status(500).json({ 
//       message: 'Error adding book to cart',
//       error: process.env.NODE_ENV === 'development' ? err.message : undefined
//     });
//   }
// };


// exports.getCart = async (req, res) => {
//   try {
//     const cart = await Cart.findOne({ userId: req.user.id })
//       .populate({
//         path: 'books.bookId',
//         select: 'title author price imageCloudinaryId'
//       });

//     if (!cart) {
//       return res.json({ items: [] });
//     }

//     const items = cart.books
//       .filter(item => item.bookId) // ignore deleted books
//       .map(item => ({
//         id: item._id,
//         book: {
//           _id: item.bookId._id,
//           title: item.bookId.title,
//           author: item.bookId.author,
//           price: item.bookId.price,
//           image: item.bookId.imageCloudinaryId
//             ? cloudinary.url(item.bookId.imageCloudinaryId, {
//                 width: 500,
//                 height: 750,
//                 crop: 'fill',
//                 quality: 'auto',
//                 fetch_format: 'auto',
//                 secure: true
//               })
//             : '/fallback-book-cover.jpg'
//         },
//         quantity: item.quantity
//       }));

//     res.json({ items });
//   } catch (err) {
//     console.error('Error fetching cart:', err);
//     res.status(500).json({
//       message: 'Error fetching cart',
//       error: process.env.NODE_ENV === 'development' ? err.message : undefined
//     });
//   }
// };


// // Remove item from cart
// exports.removeFromCart = async (req, res) => {
//   try {
//     const cart = await Cart.findOne({ userId: req.user.id });
    
//     if (!cart) {
//       return res.status(404).json({ message: 'Cart not found' });
//     }

//     const initialCount = cart.books.length;
//     cart.books = cart.books.filter(
//       item => item.bookId.toString() !== req.params.bookId
//     );

//     if (cart.books.length === initialCount) {
//       return res.status(404).json({ message: 'Book not found in cart' });
//     }

//     await cart.save();
//     res.json({ message: 'Book removed from cart', cart });
//   } catch (err) {
//     console.error('Error removing from cart:', err);
//     res.status(500).json({ 
//       message: 'Error removing book',
//       error: process.env.NODE_ENV === 'development' ? err.message : undefined
//     });
//   }
// };

// // Clear entire cart
// exports.clearCart = async (req, res) => {
//   try {
//     const result = await Cart.findOneAndUpdate(
//       { userId: req.user.id },
//       { $set: { books: [] } },
//       { new: true }
//     );

//     if (!result) {
//       return res.status(404).json({ message: 'Cart not found' });
//     }

//     res.json({ message: 'Cart cleared', cart: result });
//   } catch (err) {
//     console.error('Error clearing cart:', err);
//     res.status(500).json({ 
//       message: 'Error clearing cart',
//       error: process.env.NODE_ENV === 'development' ? err.message : undefined
//     });
//   }
// };






const Cart = require('../models/cart');
const Book = require('../models/book');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Add book to cart
exports.addToCart = async (req, res) => {
  const { bookId, quantity } = req.body;

  try {
    // Validate book exists
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Find or create user's cart
    let cart = await Cart.findOne({ userId: req.user.id });

    if (cart) {
      // Update existing item or add new one
      const existingItem = cart.books.find(item => 
        item.bookId.toString() === bookId
      );
      
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.books.push({ bookId, quantity });
      }
    } else {
      // Create new cart
      cart = new Cart({ 
        userId: req.user.id,
        books: [{ bookId, quantity }] 
      });
    }

    await cart.save();
    res.status(200).json({ message: 'Book added to cart', cart });
  } catch (err) {
    console.error('Error adding to cart:', err);
    res.status(500).json({ 
      message: 'Error adding book to cart',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Get user's cart
exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id })
      .populate({
        path: 'books.bookId',
        select: 'title author price imageCloudinaryId'
      });

    if (!cart) {
      return res.json({ items: [] });
    }

    const items = cart.books
      .filter(item => item.bookId) // Ignore deleted books
      .map(item => ({
        id: item._id,
        book: {
          _id: item.bookId._id,
          title: item.bookId.title,
          author: item.bookId.author,
          price: item.bookId.price,
          images: item.bookId.imageCloudinaryId
            ? [{
                url: cloudinary.url(item.bookId.imageCloudinaryId, {
                  width: 500,
                  height: 750,
                  crop: 'fill',
                  quality: 'auto',
                  fetch_format: 'auto',
                  secure: true
                }),
                _id: item.bookId._id // Use book ID as a placeholder
              }]
            : []
        },
        quantity: item.quantity
      }));

    res.json({ items });
  } catch (err) {
    console.error('Error fetching cart:', err);
    res.status(500).json({
      message: 'Error fetching cart',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Remove item from cart
exports.removeFromCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id });
    
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const initialCount = cart.books.length;
    cart.books = cart.books.filter(
      item => item.bookId.toString() !== req.params.bookId
    );

    if (cart.books.length === initialCount) {
      return res.status(404).json({ message: 'Book not found in cart' });
    }

    await cart.save();
    res.json({ message: 'Book removed from cart', cart });
  } catch (err) {
    console.error('Error removing from cart:', err);
    res.status(500).json({ 
      message: 'Error removing book',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Clear entire cart
exports.clearCart = async (req, res) => {
  try {
    const result = await Cart.findOneAndUpdate(
      { userId: req.user.id },
      { $set: { books: [] } },
      { new: true }
    );

    if (!result) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    res.json({ message: 'Cart cleared', cart: result });
  } catch (err) {
    console.error('Error clearing cart:', err);
    res.status(500).json({ 
      message: 'Error clearing cart',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};