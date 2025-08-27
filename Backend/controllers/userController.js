const userQuery = require('../queries/userQueries');

// Get all users
module.exports = {
    getAllUsers: async (req, res) => {
        try {
            const users = await userQuery.getAllUsers();
            res.status(200).json(users);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching users', error });
        }
    },

    // Get user by ID 
    getUserById: async (req, res) => {
        try {
            const user = await userQuery.getUserById(req.params.id);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            res.status(200).json(user);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching user', error });
        }
    },
    // Create a new user
    createUser: async (req, res) => {
        try {
            const userData = req.body;
            if (!userData || Object.keys(userData).length === 0) {
                return res.status(400).json({ message: 'User data cannot be empty.' });
            }
            const newUser = await userQueries.createUser(userData);
            res.status(201).json(newUser); // 201 Created
        } catch (error) {
            // Duplicate key error catch
            if (error.code === 11000) {
                return res.status(409).json({ message: `User with userId ${req.body.userId} already exists.` }); // 409 Conflict
            }
            res.status(500).json({ message: 'Error creating user', error: error.message });
        }
    },
    // Update user by ID
    updateUser: async (req, res) => {
        try {
            const userId = parseInt(req.params.userId);
            if (isNaN){
                return res.status(400).json({ message: "User ID must be a number"})
            }

            const updateData = req.body;
            if (!updateData || Object.keys(updateData).length === 0) {
                return res.status(400).json({ message: 'Update data cannot be empty.' });
            }

            const updatedUser = await userQuery.updateUser(req.params.id, req.body);
            if (!updatedUser) {
                return res.status(404).json({ message: 'User not found' });
            }

            res.status(200).json(updatedUser);
        } catch (error) {
            res.status(500).json({ message: 'Error updating user', error });
        }
    },
    // Delete user by ID
    deleteUser: async (req, res) => {
        try {
            const userId = parseInt(req.params.userId);
            if (isNaN(userId)) {
                return res.status(400).json({ message: 'User ID must be a number.' });
            }

            const deletedUser = await userQuery.deleteUser(req.params.id);
            if (!deletedUser) {
                return res.status(404).json({ message: 'User not found' });
            }
            res.status(200).json({ message: 'User deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Error deleting user', error });
        }
    },

    addUserVote: async (req, res) => {
        try {
            const userId = parseInt(req.params.userId);
            const { electionType } = req.body;

            if (isNaN(userId)) {
                return res.status(400).json({ message: 'User ID must be a number.' });
            }
            if (!electionType) {
                return res.status(400).json({ message: 'Election type is required.' });
            }

            const updatedUser = await userQueries.addVoteToUser(userId, electionType);
            if (!updatedUser) {
                return res.status(404).json({ message: `User with ID ${userId} not found.` });
            }
            res.status(200).json(updatedUser);
        } catch (error) {
            // Handle the specific "already voted" error from the query
            if (error.message.includes('already voted')) {
                return res.status(409).json({ message: error.message }); // 409 Conflict
            }
            res.status(500).json({ message: 'Error adding vote', error: error.message });
        }
    },

};