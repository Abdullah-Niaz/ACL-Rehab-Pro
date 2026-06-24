import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  exerciseId: String,
  exerciseName: String,
  date: {
    type: Date,
    default: Date.now
  },
  completed: {
    type: Boolean,
    default: false
  },
  painScore: Number,
  swellingScore: Number,
  difficultyScore: Number,
  notes: String,
  
  // Daily metrics summary (to preserve existing analytics/dashboard logic)
  phaseNumber: Number,
  weekNumber: Number,
  operatedQuad: Number,
  healthyQuad: Number,
  flexion: Number,
  extension: Number,
  weight: Number,
  sleepHours: Number,
  stepCount: Number,
  confidenceScore: Number,
  recoveryScore: Number
}, { timestamps: true });

export default mongoose.model('ProgressLog', schema);
