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
            const newUser = await userQuery.createUser(req.body);
            res.status(201).json(newUser);
        } catch (error) {
            res.status(500).json({ message: 'Error creating user', error });
        }
    },
    // Update user by ID
    updateUser: async (req, res) => {
        try {
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
            const deletedUser = await userQuery.deleteUser(req.params.id);
            if (!deletedUser) {
                return res.status(404).json({ message: 'User not found' });
            }
            res.status(200).json({ message: 'User deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Error deleting user', error });
        }
    }
};