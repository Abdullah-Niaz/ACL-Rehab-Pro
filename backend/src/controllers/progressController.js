import ProgressLog from '../models/ProgressLog.js';
import PatientProfile from '../models/PatientProfile.js';
import RehabPlan from '../models/RehabPlan.js';

export async function createLog(req, res) {
  try {
    const patientId = req.user._id;

    // Retrieve patient profile and update the current flexion, quad sizes etc.
    const profile = await PatientProfile.findOne({ userId: patientId });
    if (!profile) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }

    const {
      exerciseId,
      exerciseName,
      completed = true,
      painScore,
      swellingScore,
      difficultyScore,
      notes,
      phaseNumber,
      weekNumber,
      measurements,
      confidenceScore,
      recoveryScore,
      exerciseLogs
    } = req.body;

    // Extract measurements
    let opQuad = measurements?.operatedQuadSize ?? req.body.operatedQuad;
    let hlQuad = measurements?.healthyQuadSize ?? req.body.healthyQuad;
    let flex = measurements?.flexion ?? req.body.flexion;
    let ext = measurements?.extension ?? req.body.extension;
    let wt = measurements?.weight ?? req.body.weight;
    let sleep = measurements?.sleepHours ?? req.body.sleepHours;
    let steps = measurements?.stepCount ?? req.body.stepCount;

    // Update patient profile measurements so that patient profile always reflects the latest values
    if (flex !== undefined) profile.currentFlexion = flex;
    if (opQuad !== undefined) profile.operatedQuad = opQuad;
    if (hlQuad !== undefined) profile.healthyQuad = hlQuad;
    await profile.save();

    let logsSaved = [];
    if (exerciseLogs && exerciseLogs.length > 0) {
      for (const exLog of exerciseLogs) {
        const newLog = await ProgressLog.create({
          patientId,
          exerciseId: exLog.exerciseId || exerciseId || 'general',
          exerciseName: exLog.exerciseName || exerciseName || 'Daily Rehab Session',
          completed: exLog.completed ?? completed,
          painScore: exLog.painScore !== undefined ? exLog.painScore : painScore,
          swellingScore: exLog.swellingScore !== undefined ? exLog.swellingScore : swellingScore,
          difficultyScore: exLog.difficultyScore !== undefined ? exLog.difficultyScore : difficultyScore,
          notes: exLog.notes || notes,
          phaseNumber: phaseNumber || profile.currentPhase,
          weekNumber: weekNumber || profile.currentWeek,
          operatedQuad: opQuad || profile.operatedQuad,
          healthyQuad: hlQuad || profile.healthyQuad,
          flexion: flex || profile.currentFlexion,
          extension: ext,
          weight: wt,
          sleepHours: sleep,
          stepCount: steps,
          confidenceScore,
          recoveryScore
        });
        logsSaved.push(newLog);
      }
    } else {
      const newLog = await ProgressLog.create({
        patientId,
        exerciseId: exerciseId || 'general',
        exerciseName: exerciseName || 'Daily Rehab Session',
        completed,
        painScore,
        swellingScore,
        difficultyScore,
        notes,
        phaseNumber: phaseNumber || profile.currentPhase,
        weekNumber: weekNumber || profile.currentWeek,
        operatedQuad: opQuad || profile.operatedQuad,
        healthyQuad: hlQuad || profile.healthyQuad,
        flexion: flex || profile.currentFlexion,
        extension: ext,
        weight: wt,
        sleepHours: sleep,
        stepCount: steps,
        confidenceScore,
        recoveryScore
      });
      logsSaved.push(newLog);
    }

    res.status(201).json(logsSaved[0]);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error saving progress' });
  }
}

function mapLogs(logs) {
  return logs.map(l => ({
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
    },
    exerciseLogs: [
      {
        exerciseId: l.exerciseId,
        exerciseName: l.exerciseName,
        completed: l.completed,
        painScore: l.painScore,
        swellingScore: l.swellingScore,
        difficultyScore: l.difficultyScore,
        notes: l.notes
      }
    ]
  }));
}

export async function myProgress(req, res) {
  try {
    const profile = await PatientProfile.findOne({ userId: req.user._id })
      .populate('userId', 'name email role')
      .populate('doctorId', 'name email');

    if (!profile) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }

    const plan = await RehabPlan.findOne({ patientId: req.user._id });
    const logs = await ProgressLog.find({ patientId: req.user._id }).sort('date');

    const formattedPatient = {
      _id: profile._id,
      user: profile.userId,
      doctor: profile.doctorId,
      currentPhase: profile.currentPhase,
      currentWeek: profile.currentWeek,
      assignedPlan: plan,
      profile: {
        age: profile.age,
        gender: profile.gender,
        sport: profile.sport,
        surgeryDate: profile.surgeryDate,
        graftType: profile.graftType,
        graftSize: profile.graftSize,
        tunnelPlacement: profile.tunnelPlacement,
        complications: profile.complications,
        debridementDate: profile.debridementDate,
        suturesRemovalDate: profile.suturesRemovalDate,
        currentFlexion: profile.currentFlexion,
        healthyFlexion: profile.healthyFlexion,
        operatedQuadSize: profile.operatedQuad,
        healthyQuadSize: profile.healthyQuad,
        notes: profile.notes
      }
    };

    res.json({
      patient: formattedPatient,
      logs: mapLogs(logs)
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error fetching progress' });
  }
}

export async function getLogs(req, res) {
  try {
    // req.params.patientId is the patient user's ID
    const { patientId } = req.params;

    // Check if the doctor manages this patient
    const profile = await PatientProfile.findOne({ userId: patientId });
    if (!profile) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }

    if (profile.doctorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden: You do not manage this patient' });
    }

    const logs = await ProgressLog.find({ patientId }).sort('date');
    res.json(mapLogs(logs));
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error fetching patient logs' });
  }
}

export async function rtsScore(req, res) {
  const { strength = 0, rom = 0, hop = 0, balance = 0, swelling = 10, confidence = 0, pain = 10 } = req.body;
  const score = Math.round((strength * .3) + (rom * .15) + (hop * .2) + (balance * .15) + ((10 - swelling) * 10 * .1) + (confidence * .05) + ((10 - pain) * 10 * .05));
  res.json({ score, status: score >= 95 ? 'Return-to-sport ready' : score >= 85 ? 'Late-stage rehab' : 'Not ready' });
}
