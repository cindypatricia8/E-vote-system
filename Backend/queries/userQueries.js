const User = require('../models/usermodel');

// Get all users

const getAllUsers = async () => {
    try {
        return await User.find();
    } catch (error) {
        throw new Error('Error fetching users: ' + error.message);
    }
}

// Get user by ID
const getUserById = async (id) => {
    try {
        return await User.findById({userID: id});
    } catch (error) {
        throw new Error('Error fetching user by ID: ' + error.message);
    } 
}

// Create a new user
const createUser = async (userData) => {
    try {
        const user = new User(userData);
        return await user.save();
    } catch (error) {
        throw new Error('Error creating user: ' + error.message);
    }
}

const createMultipleUsers = async (usersData) => {
    try {
        const users = await User.insertMany(usersData, { ordered: false });
        return users;
    } catch (error) {
        console.error("Error creating multiple users:", error.message);
        throw error;
    }
};

// Update user by ID
const updateUser = async (userId, updateData) => {
    try {
        const updatedUser = await User.findOneAndUpdate(
            { userId: userId },
            { $set: updateData },
            { new: true, runValidators: true }
        );
        return updatedUser;
    } catch (error) {
        console.error(`Error updating user ${userId}:`, error.message);
        throw error;
    }
};

// Delete user by ID
const deleteUser = async (id) => {
    try {
        return await User.findByIdAndDelete({userId: id});
    } catch (error) {
        throw new Error('Error deleting user: ' + error.message);
    }
}

const addVoteToUser = async (userId, electionType) => {
    try {
        // First, check if the user has already voted in this election to prevent duplicates.
        const userExists = await User.findOne({ userId, 'votes.electionType': electionType });
        if (userExists) {
            throw new Error(`User ${userId} has already voted in the '${electionType}' election.`);
        }

        // If not, add the new vote.
        const updatedUser = await User.findOneAndUpdate(
            { userId: userId },
            { $push: { votes: { electionType: electionType } } },
            { new: true } 
        );
        return updatedUser;
    } catch (error) {
        console.error(`Error adding vote for user ${userId}:`, error.message);
        throw error;
    }
};

module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    addVoteToUser,
    createMultipleUsers
};