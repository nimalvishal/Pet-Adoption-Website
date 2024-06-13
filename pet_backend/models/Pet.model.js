const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const petSchema = new Schema({
    // userEmail: {
    //     type: String,
    //     required: true
    // },
    image: {
        type: String,
        required: true
    },
    petName: {
        type: String,
        required: true
    },
    petAge: {
        type: String,
        required: true
    },
    breed: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        required: true
    },
    vaccinated: {
        type: String,
        required: true
    },
    medicalCondition: {
        type: String,
        required: true
    },
    medicalIssues: {
        type: String,
        required: true
    },
    petAddress: {
        type: String,
        required: true
    },
    // Add the 'status' field
    status: {
        type: Boolean,
        default: true,
        required: true
    },
    petphone: {
        type: Number,
        required: true,
    }
});

const Pet = mongoose.model('Pet', petSchema);

module.exports = Pet;
