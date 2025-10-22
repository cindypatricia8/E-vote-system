const userQueries = require('../queries/userQueries');
const jwt = require('jsonwebtoken');

/**
 * Generates a JSON Web Token for a given user ID.
 * @param {string} id - The user's MongoDB ObjectId.
 * @returns {string} The generated JWT.
 */
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};

/**
 * Handles user registration.
 * Expects studentId, email, password, and name in the request body.
 */
const registerUser = async (req, res) => {
    try {
        const { studentId, email, password, name, faculty, gender, yearOfStudy } = req.body;

        // 1. Basic Validation
        if (!studentId || !email || !password || !name) {
            return res.status(400).json({ message: 'Please provide all required fields: studentId, email, password, and name.' });
        }

        // 2. Create user with all the provided data
        const newUser = await userQueries.createUser({
            studentId,
            email,
            name,
            passwordHash: password, // Pass the plain password to be hashed by the model
            faculty,      
            gender,       
            yearOfStudy,  
        });

        // Generate login token
        const token = generateToken(newUser._id);

        res.status(201).json({
            status: 'success',
            token,
            data: {
                user: newUser,
            },
        });
    } catch (error) {
        // MongoDB duplicate error 
        if (error.code === 11000) {
            return res.status(409).json({ message: 'A user with that Student ID or Email already exists.' });
        }
        res.status(500).json({ message: 'Error registering user.', error: error.message });
    }
};

/**
 * Updates currently logged in user's profile 
 */
const updateUserProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        // Extract only the allowed fields from the request body
        const { name, faculty, gender, yearOfStudy } = req.body;
        const updateData = { name, faculty, gender, yearOfStudy };

        // Remove any null fields
        Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);
        
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ message: 'No update data provided.' });
        }

        const updatedUser = await userQueries.updateUser(userId, updateData);

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found.' });
        }

        res.status(200).json({
            status: 'success',
            data: {
                user: updatedUser,
            },
        });
    } catch (error) {
        res.status(500).json({ message: 'Error updating user profile.', error: error.message });
    }
};

/**
 * Handles user login.
 * Expects studentId and password in the request body.
 */
const loginUser = async (req, res) => {
    try {
        const { studentId, password } = req.body;

        if (!studentId || !password) {
            return res.status(400).json({ message: 'Please provide a student ID and password.' });
        }

        const user = await userQueries.findUserByStudentId(studentId);

        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ message: 'Invalid student ID or password.' });
        }

        const token = generateToken(user._id);

        user.passwordHash = undefined;

        res.status(200).json({
            status: 'success',
            token,
            data: {
                user,
            },
        });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in.', error: error.message });
    }
};

/**
 * Gets the profile of the currently logged-in user.
 */
const getUserProfile = async (req, res) => {
    const user = await userQueries.findUserById(req.user.id);

    if (!user) {
        return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json({
        status: 'success',
        data: {
            user,
        },
    });
};

/**
 * Gets all users.
 */
const getAllUsers = async (req, res) => {
    try {
        const users = await userQueries.getAllUsers();
        res.status(200).json({
            status: 'success',
            results: users.length,
            data: {
                users,
            },
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users.', error: error.message });
    }
};

/**
 * Deletes a user.
 */
const deleteUser = async (req, res) => {
    try {
        const user = await userQueries.deleteUser(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        res.status(204).json({ // 204 No Content
            status: 'success',
            data: null,
        });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user.', error: error.message });
    }
};

/**
 * Handles requests to search for users.
 * Expects a query parameter 'q' (e.g., /api/users/search?q=john).
 */
const searchUsers = async (req, res) => {
    try {
        const searchTerm = req.query.q || '';
        if (searchTerm.length < 2) {
            return res.status(200).json({ status: 'success', data: { users: [] } });
        }
        
        const users = await userQueries.searchUsersByNameOrId(searchTerm);
        res.status(200).json({ status: 'success', data: { users } });

    } catch (error) {
        res.status(500).json({ message: 'Error searching for users.', error: error.message });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getUserProfile,
    getAllUsers,
    deleteUser,
    updateUserProfile,
    searchUsers,
};