// const { boolean, required } = require('joi');
const mongoose = require('mongoose');

const TripSchema = new mongoose.Schema({
    destination: {
        type: String,
        required: [true, 'Please provide the destination'],
        minLength: 3,
        maxLength: 30,
    },
    startDate: {
        type: Date,
        required: [true, 'Please provide the start date'],
        default: Date.now,
    },
    duration: {
        type: Number,
        required: [true, 'Please provide the valid duration'],
        minLength: 3,
    },
    reason: {
        type: String,
        required: [true, 'Please provide the valid reason'],
        enum: ['business', 'leasure'],
        default: 'leasure',
    },
    createdBy: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: [true, 'Please provide the valid user'],
    },
}, {timestamps:true})


module.exports = mongoose.model('Trip', TripSchema);