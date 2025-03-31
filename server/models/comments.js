import mongoose from 'mongoose';

// commentSchema

const commentSchema = new mongoose.Schema({
    petId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Pet'
    },
    content: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Users'
    },
    visibleToOwner: {
        type: Boolean,
        default: false
    }
});

export default commentSchema;
