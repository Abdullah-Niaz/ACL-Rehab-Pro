import mongoose from "mongoose";
const schema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "PatientProfile" },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    note: String,
    tags: [String],
  },
  { timestamps: true },
);
export default mongoose.model("ClinicalNote", schema);
