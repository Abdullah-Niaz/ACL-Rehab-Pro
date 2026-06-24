import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.resolve(process.cwd(), ".env"),
});
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import User from '../models/User.js';
import PatientProfile from '../models/PatientProfile.js';
import RehabPlan from '../models/RehabPlan.js';
import ProgressLog from '../models/ProgressLog.js';
import ClinicalNote from '../models/ClinicalNote.js';
import Message from '../models/Message.js';
import { defaultAclPlan, normalizePlan } from '../data/defaultPlan.js';

await connectDB();

await Promise.all([
  User.deleteMany(),
  PatientProfile.deleteMany(),
  RehabPlan.deleteMany(),
  ProgressLog.deleteMany(),
  ClinicalNote.deleteMany(),
  Message.deleteMany()
]);

const doctor = await User.create({
  name: 'Dr. Muhammad Ali Sheikh Sports Surgeon',
  email: 'doctor@aclrehabpro.com',
  password: 'Doctor123!',
  role: 'doctor',
  isActive: true
});

const patientUser = await User.create({
  name: 'Abdullah Niaz',
  email: 'patient@aclrehabpro.com',
  password: 'Patient123!',
  role: 'patient',
  isActive: true
});

const profile = await PatientProfile.create({
  userId: patientUser._id,
  doctorId: doctor._id,
  age: 23,
  gender: 'Male',
  sport: 'Football, Cricket, Volleyball',
  surgeryDate: new Date('2026-02-07'),
  graftType: 'Peroneus Longus',
  graftSize: '9.5 mm',
  tunnelPlacement: 'Anatomical ACL footprints',
  complications: 'Cyclops lesion / scar tissue, wound complication',
  debridementDate: new Date(),
  suturesRemovalDate: new Date(),
  currentFlexion: 155,
  healthyFlexion: 160,
  operatedQuad: 20.2,
  healthyQuad: 22,
  notes: 'Focus on quad hypertrophy, wound monitoring, criterion-based progression.',
  currentPhase: 3,
  currentWeek: 18
});

await RehabPlan.create({
  patientId: patientUser._id,
  doctorId: doctor._id,
  phases: normalizePlan(defaultAclPlan).phases
});

const logs = [];
for (let i = 8; i >= 0; i--) {
  logs.push({
    patientId: patientUser._id,
    date: new Date(Date.now() - i * 7 * 24 * 3600 * 1000),
    phaseNumber: 3,
    weekNumber: 18 - i,
    operatedQuad: 19.4 + i * .1,
    healthyQuad: 22,
    flexion: 145 + i * 1.2,
    extension: 0,
    weight: 75,
    sleepHours: 7 + (i % 2),
    stepCount: 3500 + i * 400,
    confidenceScore: 50 + i * 4,
    recoveryScore: 55 + i * 4,
    exerciseId: 'tke-exercise',
    exerciseName: 'Spanish Squat',
    completed: i > 1,
    painScore: 2,
    swellingScore: 1,
    difficultyScore: 5,
    notes: 'Steadily improving symmetry and ROM.'
  });
}
await ProgressLog.insertMany(logs);

// Create some seed messages
await Message.create([
  {
    doctorId: doctor._id,
    patientId: patientUser._id,
    senderId: patientUser._id,
    text: "Hi Dr. Surgeon, my knee feels slightly stiff after doing the Spanish squats today. Is that normal?",
    isRead: false
  },
  {
    doctorId: doctor._id,
    patientId: patientUser._id,
    senderId: doctor._id,
    text: "Hi Abdullah, yes that is normal in this phase. Keep the volume high but lower the load slightly if pain goes above 3/10. Let me know how it feels tomorrow.",
    isRead: true
  }
]);

console.log('\nSeed complete');
console.log('Doctor: doctor@aclrehabpro.com / Doctor123!');
console.log('Patient: patient@aclrehabpro.com / Patient123!');

await mongoose.disconnect();
