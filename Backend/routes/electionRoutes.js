const express = require('express');
const router = express.Router();
const electionController = require('../controllers/electionController');
const { protect } = require('../middleware/authMiddleware');

// All election routes require a user to be logged in
router.use(protect);

router.post('/', electionController.createElection); // Permissions checked inside controller
router.get('/active', electionController.getActiveElections);
router.get('/club/:clubId', electionController.getElectionsForClub);

router.route('/:id')
    .get(electionController.getElectionById)
    .put(electionController.updateElection) // Permissions checked inside controller
    .delete(electionController.deleteElection); // Permissions checked inside controller

module.exports = router;