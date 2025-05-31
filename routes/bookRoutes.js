const express = require('express');
const { getBooks, getBookById, addBook, updateBook, deleteBook } = require('../controllers/bookController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { uploadBookImage } = require('../controllers/bookController');

const router = express.Router();

router.get('/', getBooks);
router.get('/:id', getBookById);
router.post(
    '/',
    authMiddleware,
    adminMiddleware,
    upload.array('images', 5), // 'images' matches the frontend field name
    addBook
  );
router.put('/:id', authMiddleware, adminMiddleware, updateBook);
router.delete('/:id', authMiddleware, adminMiddleware, deleteBook);
router.post('/:id/images', upload.single('image'), uploadBookImage);


module.exports = router;
