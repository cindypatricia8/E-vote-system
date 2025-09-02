const express = require('express');
const router = express.Router();
const voteController = require('../controllers/voteController');
const { protect } = require('../middleware/authMiddleware');

// Casting a vote and viewing results requires being logged in
router.use(protect);

router.post('/election/:electionId/cast', voteController.castVote);
router.get('/election/:electionId/results', voteController.getElectionResults);

module.exports = router;