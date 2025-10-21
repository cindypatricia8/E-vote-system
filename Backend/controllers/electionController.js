const electionQueries = require('../queries/electionQueries');
const clubQueries = require('../queries/clubQueries');
const ballotQueries = require('../queries/ballotQueries'); // Needed for cascade delete

/**
 * Creates a new election.
 * Only an admin of the specified club or a system admin can create an election.
 */
const createElection = async (req, res) => {
    try {
        const { title, description, clubId, startTime, endTime, positions } = req.body;

        if (!title || !clubId || !startTime || !endTime || !positions) {
            return res.status(400).json({ message: 'Missing required fields: title, clubId, startTime, endTime, and positions are required.' });
        }

        // Permission Checks
        const club = await clubQueries.findClubById(clubId);
        if (!club) {
            return res.status(404).json({ message: `Club with ID ${clubId} not found.` });
        }

        const isClubAdmin = club.admins.some(admin => admin._id.equals(req.user._id));
        const isSystemAdmin = req.user.roles.includes('systemAdmin');

        if (!isClubAdmin && !isSystemAdmin) {
            return res.status(403).json({ message: 'You do not have permission to create an election for this club.' });
        }

        // Create the election
        const newElection = await electionQueries.createElection(req.body);
        res.status(201).json({ status: 'success', data: { election: newElection } });

    } catch (error) {
        res.status(500).json({ message: 'Error creating election.', error: error.message });
    }
};

/**
 * Retrieves a list of all elections that are currently active.
 * All users have access
 */
const getActiveElections = async (req, res) => {
    try {
        const activeElections = await electionQueries.findActiveElections();
        res.status(200).json({
            status: 'success',
            results: activeElections.length,
            data: { elections: activeElections },
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching active elections.', error: error.message });
    }
};

/**
 * Retrieves the details of a single election by its ID.
 * All users have access
 */
const getElectionById = async (req, res) => {
    try {
        const { id } = req.params;
        const election = await electionQueries.findElectionById(id);

        if (!election) {
            return res.status(404).json({ message: 'Election not found.' });
        }

        res.status(200).json({ status: 'success', data: { election } });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching election details.', error: error.message });
    }
};

/**
 * Updates an election's details.
 * Club admins or System admins have access
 */
const updateElection = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Fetch the election to check for ownership/permissions
        const election = await electionQueries.findElectionById(id);
        if (!election) {
            return res.status(404).json({ message: 'Election not found.' });
        }

        // Permission Checks
        const club = await clubQueries.findClubById(election.clubId._id);
        const isClubAdmin = club.admins.some(admin => admin._id.equals(req.user._id));
        const isSystemAdmin = req.user.roles.includes('systemAdmin');

        if (!isClubAdmin && !isSystemAdmin) {
            return res.status(403).json({ message: 'You do not have permission to update this election.' });
        }

        // Do not allow updating of club id
        delete updateData.clubId;

        // Update
        const updatedElection = await electionQueries.updateElection(id, updateData);
        res.status(200).json({ status: 'success', data: { election: updatedElection } });

    } catch (error) {
        res.status(500).json({ message: 'Error updating election.', error: error.message });
    }
};

/**
 * Deletes an election and all of its associated ballots.
 */
const deleteElection = async (req, res) => {
    try {
        const { id } = req.params;

        // Fetch the election for permission checks
        const election = await electionQueries.findElectionById(id);
        if (!election) {
            return res.status(404).json({ message: 'Election not found.' });
        }

        // Permission Checks
        const club = await clubQueries.findClubById(election.clubId._id);
        const isClubAdmin = club.admins.some(admin => admin._id.equals(req.user._id));
        const isSystemAdmin = req.user.roles.includes('systemAdmin');

        if (!isClubAdmin && !isSystemAdmin) {
            return res.status(403).json({ message: 'You do not have permission to delete this election.' });
        }

        // Delete associated ballots
        await ballotQueries.deleteBallotsForElection(id);
        
        // Delete election
        await electionQueries.deleteElection(id);

        res.status(204).json({ status: 'success', data: null });

    } catch (error) {
        res.status(500).json({ message: 'Error deleting election.', error: error.message });
    }
};


/**
 * Finds all elections under a club
 */
const getElectionsForClub = async (req, res) => {
    try {
        const { clubId } = req.params;
        const elections = await electionQueries.findElectionsByClub(clubId);
        res.status(200).json({ status: 'success', data: { elections } });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching club elections.', error: error.message });
    }
};

/**
 * Retrieves detailed analytics for an election.
 */
const getAnalyticsForElection = async (req, res) => {
    try {
        const { id } = req.params;
        const analyticsData = await electionQueries.getElectionAnalytics(id);
        res.status(200).json({ status: 'success', data: analyticsData });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching election analytics.', error: error.message });
    }
};

module.exports = {
    createElection,
    getActiveElections,
    getElectionById,
    updateElection,
    deleteElection,
    getElectionsForClub,
    getAnalyticsForElection,
};