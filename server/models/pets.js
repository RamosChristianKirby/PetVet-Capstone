import mongoose from 'mongoose';
import commentSchema from './comments.js';

// Vaccination History
const vaccinationSchema = new mongoose.Schema({
    date: Date,
    vaccinationType: String,
})

// petSchema

const petSchema = new mongoose.Schema({
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    name: {
        type: String,
        required: true
    },
    petType: {
        type: String,
        required: true,
        enum: ['dog', 'cat']
    },
    breed1: {
        type: String,
        required: true, // Make it required to ensure breed1 is always provided
    },
    breed2: {
        type: String,
        required: true, // Make it required to ensure breed2 is always provided
    },
    status: {
        type: String,
        required: true,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    dob: {
        type: Date,
        required: true
    },
    rfidNumber: {
        type: String,
        required: true,
        unique: true,
    },
    vaccinationHistory: [{ type: vaccinationSchema, default: undefined }],
    contact: {
        type: String,
        required: true,
        validate: {
            validator: function (v) {
                return /^[0-9]{11}$/.test(v); // Ensures contact number is exactly 11 digits
            },
            message: props => `${props.value} is not a valid contact number!`
        }
    },
    address: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: false,
        match: [/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Please enter a valid email address!'] // Strict email validation
    },
});

const Pet = mongoose.model('Pet', petSchema);
export default Pet;
