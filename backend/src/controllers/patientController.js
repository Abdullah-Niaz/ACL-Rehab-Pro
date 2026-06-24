import PatientProfile from '../models/PatientProfile.js';
import ProgressLog from '../models/ProgressLog.js';
import RehabPlan from '../models/RehabPlan.js';

export async function dashboard(req, res) {
  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ message: 'Forbidden: Doctor access only' });
    }

    const profiles = await PatientProfile.find({ doctorId: req.user._id })
      .populate('userId', 'name email role');

    const patientUserIds = profiles.map(p => p.userId._id);
    const logs = await ProgressLog.find({ patientId: { $in: patientUserIds } }).sort('date');

    // Format profiles to match what DoctorDashboard expects
    const formattedPatients = profiles.map(p => ({
      _id: p._id,
      user: p.userId,
      currentPhase: p.currentPhase,
      currentWeek: p.currentWeek,
      status: 'Active',
      profile: {
        operatedQuadSize: p.operatedQuad,
        healthyQuadSize: p.healthyQuad,
        currentFlexion: p.currentFlexion,
        healthyFlexion: p.healthyFlexion,
        age: p.age,
        gender: p.gender,
        sport: p.sport,
        surgeryDate: p.surgeryDate,
        graftType: p.graftType,
        graftSize: p.graftSize,
        complications: p.complications,
        notes: p.notes
      }
    }));

    // Format logs to match what DoctorDashboard chart expects
    const formattedLogs = logs.map(l => ({
      _id: l._id,
      patientId: l.patientId,
      date: l.date,
      recoveryScore: l.recoveryScore,
      confidenceScore: l.confidenceScore,
      measurements: {
        operatedQuadSize: l.operatedQuad,
        healthyQuadSize: l.healthyQuad,
        flexion: l.flexion,
        extension: l.extension,
        weight: l.weight,
        sleepHours: l.sleepHours,
        stepCount: l.stepCount
      }
    }));

    res.json({
      patients: formattedPatients,
      logs: formattedLogs
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error loading dashboard' });
  }
}
