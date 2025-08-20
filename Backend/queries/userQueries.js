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
        return await User.findById(id);
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

// Update user by ID
const updateUser = async (id, userData) => {
    try {
        return await User.findByIdAndUpdate(id, userData, { new: true });
    } catch (error) {
        throw new Error('Error updating user: ' + error.message);
    }  
}

// Delete user by ID
const deleteUser = async (id) => {
    try {
        return await User.findByIdAndDelete(id);
    } catch (error) {
        throw new Error('Error deleting user: ' + error.message);
    }
}

module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser
};