const express = require('express');
const { register, login, getMe, updateMe, upload } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authMiddleware, getMe);
router.put('/me', authMiddleware, upload.single('profilePic'), updateMe);

module.exports = router;