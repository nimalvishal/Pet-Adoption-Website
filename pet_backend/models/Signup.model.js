const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const signupSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    }
}, {
    timestamps: true
});

const SignupData = mongoose.model('SignupData', signupSchema);

module.exports = SignupData;
