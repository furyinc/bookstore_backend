const Book = require('../models/book');
const cloudinary = require('cloudinary').v2;

// Upload single book image and attach to book
exports.uploadBookImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image uploaded' });
    }

    const image = {
      url: req.file.path,
      publicId: req.file.filename,
      isPrimary: true // Or add logic to set only first image as primary
    };

    const book = await Book.findByIdAndUpdate(
      req.params.id,
      { $push: { images: image } },
      { new: true }
    );

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    res.json(book);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all books with optional limit/sort
exports.getBooks = async (req, res) => {
  try {
    const { limit, sort } = req.query;
    const query = Book.find();

    if (limit) query.limit(parseInt(limit));
    if (sort) query.sort(sort);

    const books = await query.exec();
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching books' });
  }
};

// Get single book by ID
exports.getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.json(book);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching book details' });
  }
};

// Add new book (admin only)
exports.addBook = async (req, res) => {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ message: 'Access denied' });
  }

  try {
    console.log('Received book data:', req.body);
    console.log('Uploaded files:', req.files);

    const {
      title,
      description,
      price,
      stock
    } = req.body;

    const images = req.files?.map((file, index) => ({
      url: file.path,
      publicId: file.filename,
      isPrimary: index === 0
    })) || [];

    const newBook = new Book({
      title,
      description,
      price,
      stock,
      images
    });

    const savedBook = await newBook.save();
    res.status(201).json(savedBook);

  } catch (err) {
    console.error('[Add Book Error]', err);

    if (err.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Validation failed',
        errors: err.errors
      });
    }

    res.status(500).json({
      message: 'Server error',
      error: err.message
    });
  }
};

// Update book (admin only)
exports.updateBook = async (req, res) => {
  if (!req.user.isAdmin) return res.status(403).json({ message: 'Access denied' });

  try {
    const book = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!book) return res.status(404).json({ message: 'Book not found' });
    res.json(book);
  } catch (err) {
    res.status(500).json({ message: 'Error updating book' });
  }
};

// Delete book (admin only)
exports.deleteBook = async (req, res) => {
  if (!req.user.isAdmin) return res.status(403).json({ message: 'Access denied' });

  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });

    // Optional: delete Cloudinary images
    // await Promise.all(book.images.map(img => cloudinary.uploader.destroy(img.publicId)));

    res.json({ message: 'Book deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting book' });
  }
};
