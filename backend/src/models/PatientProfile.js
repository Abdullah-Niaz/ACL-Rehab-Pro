import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  age: Number,
  gender: String,
  sport: String,
  surgeryDate: Date,
  graftType: String,
  graftSize: String,
  tunnelPlacement: String,
  complications: String,
  debridementDate: Date,
  debridementDate2: Date,
  suturesRemovalDate: Date,
  currentFlexion: Number,
  healthyFlexion: Number,
  operatedQuad: Number,
  healthyQuad: Number,
  notes: String,
  currentPhase: { type: Number, default: 1 },
  currentWeek: { type: Number, default: 1 },
  readyForProgression: { type: Boolean, default: false },
  highRisk: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('PatientProfile', schema);
