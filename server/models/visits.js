import mongoose from "mongoose";
const visitSchema = new mongoose.Schema(
  {
    petId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Pet",
      index: true,
    },
    date: { type: Date, required: true, index: true },
    comment: { type: String, default: "", maxlength: 2000 },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
      index: true,
    },
    status: {
      type: String,
      enum: ["scheduled", "completed", "cancelled"],
      default: "scheduled",
    },
  },
  { timestamps: true, optimisticConcurrency: true },
);
export default mongoose.model("Visit", visitSchema);
