const express = require('express');
const { getBooks, addBook, deleteBook, editBook, upload } = require('../controllers/bookController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);
router.get('/', getBooks);
router.post('/', upload.single('coverImage'), addBook);
router.delete('/:id', deleteBook);
router.put('/:id', upload.single('coverImage'), editBook);

module.exports = router;