import mongoose from "mongoose";
export default new mongoose.Schema({
  content: { type: String, required: true, trim: true, maxlength: 5000 },
  author: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
  visibleToOwner: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});
