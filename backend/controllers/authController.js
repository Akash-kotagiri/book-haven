const User = require('../models/User');
const jwt = require('jsonwebtoken');
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
    folder: 'book-haven/profiles',
    allowed_formats: ['jpg', 'png'],
  },
});
const upload = multer({ storage });

const register = async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Please provide all fields' });
  }
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }
    const user = new User({ username, email, password, favorites: [] });
    await user.save();
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        favorites: user.favorites,
        bio: user.bio,
        profilePic: user.profilePic,
        booksAddedCount: user.booksAddedCount,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      throw new Error('Invalid credentials');
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        favorites: user.favorites,
        bio: user.bio,
        profilePic: user.profilePic,
        booksAddedCount: user.booksAddedCount,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const updateMe = async (req, res) => {
  const { username, email, bio, favorites } = req.body;
  const profilePic = req.file ? req.file.path : null; // Cloudinary URL

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    user.username = username || user.username;
    user.email = email || user.email;
    user.bio = bio || user.bio;
    if (profilePic) user.profilePic = profilePic;
    if (favorites) user.favorites = favorites;
    await user.save();
    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      bio: user.bio,
      profilePic: user.profilePic,
      favorites: user.favorites,
      booksAddedCount: user.booksAddedCount,
      createdAt: user.createdAt,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = { register, login, getMe, updateMe, upload };