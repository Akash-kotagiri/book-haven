const Book = require('../models/Book');
const User = require('../models/User');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Multer with Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'book-haven/covers',
    allowed_formats: ['jpg', 'png'],
  },
});
const upload = multer({ storage });

const getBooks = async (req, res) => {
  try {
    const books = await Book.find({ user: req.user.id });
    res.json(books);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const addBook = async (req, res) => {
  const { title, author, description, category } = req.body;
  const coverImage = req.file ? req.file.path : null; // Cloudinary URL

  try {
    const book = new Book({
      title,
      author,
      description,
      category: category || 'Uncategorized',
      coverImage,
      user: req.user.id,
    });
    await book.save();

    const user = await User.findById(req.user.id);
    if (!user) throw new Error('User not found');
    user.booksAddedCount = (user.booksAddedCount || 0) + 1;
    await user.save();

    res.status(201).json({ book, user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) throw new Error('Book not found');
    if (book.user.toString() !== req.user.id) throw new Error('Unauthorized');
    await book.deleteOne();

    const user = await User.findById(req.user.id);
    if (!user) throw new Error('User not found');
    user.booksAddedCount = Math.max((user.booksAddedCount || 0) - 1, 0);
    await user.save();

    res.json({ message: 'Book deleted', user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const editBook = async (req, res) => {
  const { title, author, description, category } = req.body;
  const coverImage = req.file ? req.file.path : req.body.coverImage;

  try {
    const book = await Book.findById(req.params.id);
    if (!book) throw new Error('Book not found');
    if (book.user.toString() !== req.user.id) throw new Error('Unauthorized');

    book.title = title || book.title;
    book.author = author || book.author;
    book.description = description || book.description;
    book.category = category || book.category;
    book.coverImage = coverImage || book.coverImage;

    await book.save();
    res.json(book);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = { getBooks, addBook, deleteBook, editBook, upload };