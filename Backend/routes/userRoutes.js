const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// Public routes
router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);

// Protected routes (requires user to be logged in)
router.get('/profile', protect, userController.getUserProfile);
router.put('/profile',protect,userController.updateUserProfile);
router.get('/search', protect, userController.searchUsers);

// System admin-only routes
router.get('/', protect, restrictTo('systemAdmin'), userController.getAllUsers);
router.delete('/:id', protect, restrictTo('systemAdmin'), userController.deleteUser);

module.exports = router;