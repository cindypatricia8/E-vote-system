const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    // University student id different from MongoDB id
    studentId: {
        type: String,
        required: [true, 'Student ID is required.'],
        unique: true,
        index: true,
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required.'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/\S+@\S+\.\S+/, 'is invalid'] 
    },
    // Hashed password
    passwordHash: {
        type: String,
        required: [true, 'Password is required.']
    },
    name: {
        type: String,
        required: [true, 'Name is required.'],
        trim: true
    },
    faculty: String,
    gender: String,
    yearOfStudy: Number,
    roles: {
        type: [String],
        enum: ['student', 'clubAdmin', 'systemAdmin'],
        default: ['student']
    },
    // This array stores references to the Elections a user has voted in.
    // This is how we prevent duplicate voting without linking to the actual vote.
    votedInElections: {
        type: [Schema.Types.ObjectId],
        ref: 'Election', // This refers to the 'Election' model
        default: []
    }
}, {
    timestamps: true 
});

// Before saving a new user or updating a password, hash the password.
userSchema.pre('save', async function(next) {
    if (!this.isModified('passwordHash')) {
        return next();
    }
    try {
        const salt = await bcrypt.genSalt(10);
        this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare a candidate password with the stored hash
userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.passwordHash);
    } catch (error) {
        throw new Error(error);
    }
};

const User = mongoose.model('User', userSchema);

module.exports = User;