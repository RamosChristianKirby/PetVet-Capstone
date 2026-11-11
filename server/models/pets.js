import mongoose from "mongoose";
import commentSchema from "./comments.js";

const vaccinationSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  vaccinationType: { type: String, required: true, trim: true, maxlength: 120 },
});
const petSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
      index: true,
    },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    petType: { type: String, required: true, enum: ["dog", "cat"] },
    breed1: { type: String, required: true, trim: true },
    breed2: { type: String, default: "", trim: true },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      lowercase: true,
    },
    dob: { type: Date, required: true },
    rfidNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    vaccinationHistory: { type: [vaccinationSchema], default: [] },
    publicComments: { type: [commentSchema], default: [] },
    doctorComments: { type: [commentSchema], default: [] },
    contact: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    email: { type: String, lowercase: true, trim: true },
    deletedAt: { type: Date, default: null, index: true },
  },
  { timestamps: true, optimisticConcurrency: true },
);
export default mongoose.model("Pet", petSchema);
