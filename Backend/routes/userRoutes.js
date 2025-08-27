const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// CRUD Routes for User
router.get('/', userController.getAllUsers);

router.post('/', userController.createUser);

router.get('/:userId', userController.getUserById);

router.put('/:userId', userController.updateUser);

router.delete('/:userId', userController.deleteUser);

router.post('/:userId/votes', userController.addUserVote)

module.exports = router;