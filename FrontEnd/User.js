const mongoose = require('mongoose');

const companyUserSchema = new mongoose.Schema({
    email: {type: String, required: true, unique: true},
    passwordHash: { type: String, required: true}
});

const googleUserSchema = new mongoose.Schema({
    googleId: { type: String, required: true},
    displayName: String,
    email: String,
    role: {type: String, default: 'read-only'}
});

const User = mongoose.model('User', companyUserSchema);
const ReadOnlyUser = mongoose.model('ReadOnlyUser', googleUserSchema);

module.exports = { User, ReadOnlyUser };