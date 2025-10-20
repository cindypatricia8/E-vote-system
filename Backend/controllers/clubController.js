const clubQueries = require('../queries/clubQueries');
const userQueries = require('../queries/userQueries'); 

/**
 * Creates a new club. The user creating the club is automatically assigned as the first admin.
 * Requires systemAdmin role.
 */
const createClub = async (req, res) => {
    try {
        const { name, description, admins } = req.body;

        if (!name) {
            return res.status(400).json({ message: 'Club name is required.' });
        }

        const adminSet = new Set([req.user._id.toString()]);
        // Add set of admins to members aswell
        if (admins && Array.isArray(admins)) {
            admins.forEach(adminId => adminSet.add(adminId));
        }

        const finalAdmins = Array.from(adminSet);

        // Create the club data object
        const clubData = {
            name,
            description,
            admins: finalAdmins,
            members: finalAdmins, 
        };

        const newClub = await clubQueries.createClub(clubData);
        res.status(201).json({ status: 'success', data: { club: newClub } });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ message: `A club with the name "${req.body.name}" already exists.` });
        }
        res.status(500).json({ message: 'Error creating club.', error: error.message });
    }
};

/**
 * Retrieves a list of all clubs. No roles required
 */
const getAllClubs = async (req, res) => {
    try {
        const clubs = await clubQueries.getAllClubs();
        res.status(200).json({
            status: 'success',
            results: clubs.length,
            data: { clubs },
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching clubs.', error: error.message });
    }
};

/**
 * Retrieves all clubs that the currently logged-in user is an admin of.
 */
const getManagedClubs = async (req, res) => {
    try {
        const adminId = req.user._id;

        const clubs = await clubQueries.findClubsByAdmin(adminId);
        
        res.status(200).json({
            status: 'success',
            results: clubs.length,
            data: { clubs },
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching managed clubs.', error: error.message });
    }
};

/**
 * Retrieves details for a single club by its ID. No roles required
 */
const getClubById = async (req, res) => {
    try {
        const { id } = req.params;
        const club = await clubQueries.findClubById(id);

        if (!club) {
            return res.status(404).json({ message: 'Club not found.' });
        }

        res.status(200).json({ status: 'success', data: { club } });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching club details.', error: error.message });
    }
};

/**
 * Updates a clubs information.
 * Only admins of that club or system admins can perform this action.
 */
const updateClub = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;

        // Check if user is a system admin or a club admin
        const club = await clubQueries.findClubById(id);
        if (!club) {
            return res.status(404).json({ message: 'Club not found.' });
        }
        
        const isAdmin = club.admins.some(admin => admin._id.equals(req.user._id));
        const isSystemAdmin = req.user.roles.includes('systemAdmin');

        if (!isAdmin && !isSystemAdmin) {
            return res.status(403).json({ message: 'You do not have permission to update this club.' });
        }
        
        const updatedClub = await clubQueries.updateClub(id, { name, description });
        res.status(200).json({ status: 'success', data: { club: updatedClub } });
    } catch (error) {
        res.status(500).json({ message: 'Error updating club.', error: error.message });
    }
};

/**
 * Deletes a club and it's associated objects. Requires systemAdmin role.
 */
const deleteClub = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedClub = await clubQueries.deleteClubAndCascade(id);

        if (!deletedClub) {
            return res.status(404).json({ message: 'Club not found.' });
        }

        res.status(204).json({ status: 'success', data: null });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting club.', error: error.message });
    }
};

/**
 * Adds a member to a club. Only a club admin can do this.
 */
const addMember = async (req, res) => {
    try {
        const { clubId } = req.params;
        const { userId } = req.body; // The ID of the user to be added

        if (!userId) {
            return res.status(400).json({ message: 'User ID is required to add a member.' });
        }

        // Check if the user to be added actually exists
        const userToAdd = await userQueries.findUserById(userId);
        if (!userToAdd) {
            return res.status(404).json({ message: `User with ID ${userId} not found.` });
        }

        const club = await clubQueries.findClubById(clubId);
        if (!club) {
            return res.status(404).json({ message: 'Club not found.' });
        }

        // Check if the logged in user is the admin
        const isAdmin = club.admins.some(admin => admin._id.equals(req.user._id));
        if (!isAdmin) {
            return res.status(403).json({ message: 'You do not have permission to add members to this club.' });
        }

        const updatedClub = await clubQueries.addMemberToClub(clubId, userId);
        res.status(200).json({ status: 'success', data: { club: updatedClub } });
    } catch (error) {
        res.status(500).json({ message: 'Error adding member to club.', error: error.message });
    }
};

/**
 * Removes a member from a club. Only a club admin can do this.
 */
const removeMember = async (req, res) => {
    try {
        const { clubId, memberId } = req.params;

        const club = await clubQueries.findClubById(clubId);
        if (!club) {
            return res.status(404).json({ message: 'Club not found.' });
        }

        // Check if the logged in user is the admin
        const isAdmin = club.admins.some(admin => admin._id.equals(req.user._id));
        if (!isAdmin) {
            return res.status(403).json({ message: 'You do not have permission to remove members from this club.' });
        }

        const updatedClub = await clubQueries.removeMemberFromClub(clubId, memberId);
        res.status(200).json({ status: 'success', data: { club: updatedClub } });
    } catch (error) {
        res.status(500).json({ message: 'Error removing member from club.', error: error.message });
    }
};

/**
 * Adds a new admin to a club
 * Only an existing admin of the club can perform this action
 */
const addAdmin = async (req, res) => {
    try {
        const { clubId } = req.params;
        const { userId: userToPromoteId } = req.body;
        const requestingUserId = req.user._id;

        if (!userToPromoteId) {
            return res.status(400).json({ message: 'User ID to promote is required.' });
        }

        const club = await clubQueries.findClubById(clubId);
        if (!club) {
            return res.status(404).json({ message: 'Club not found.' });
        }

        const isRequestingUserAdmin = club.admins.some(admin => admin._id.equals(requestingUserId));
        if (!isRequestingUserAdmin) {
            return res.status(403).json({ message: 'You do not have permission to add admins to this club.' });
        }

        const updatedClub = await clubQueries.addAdminToClub(clubId, userToPromoteId);
        res.status(200).json({ status: 'success', data: { club: updatedClub } });
        
    } catch (error) {
        res.status(500).json({ message: 'Error promoting user to admin.', error: error.message });
    }
};

module.exports = {
    createClub,
    getAllClubs,
    getClubById,
    updateClub,
    deleteClub,
    addMember,
    removeMember,
    getManagedClubs,
    addAdmin,
};