const express = require('express');
const router = express.Router();
const clubController = require('../controllers/clubController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// Public routes
router.get('/', clubController.getAllClubs);
router.get('/:id', clubController.getClubById);

// System admin routes
router.post('/', protect, restrictTo('systemAdmin'), clubController.createClub);
router.put('/:id', protect, clubController.updateClub); // Permissions checked inside controller
router.delete('/:id', protect, restrictTo('systemAdmin'), clubController.deleteClub);

// Club admin routes
router.post('/:clubId/members', protect, clubController.addMember);
router.delete('/:clubId/members/:memberId', protect, clubController.removeMember);

module.exports = router;