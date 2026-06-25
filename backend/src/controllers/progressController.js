import ProgressLog from '../models/ProgressLog.js';
import PatientProfile from '../models/PatientProfile.js';
import RehabPlan from '../models/RehabPlan.js';
import User from '../models/User.js';
import { sendRiskAlertEmail } from '../utils/email.js';

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

    // ----------------------------------------------------
    // Clinical Business Logic Rules Engine
    // ----------------------------------------------------
    let isReadyForProgression = false;
    let isHighRisk = false;
    let triggeredFlags = [];

    const currentOp = opQuad !== undefined ? opQuad : (profile.operatedQuad || 0);
    const currentHl = hlQuad !== undefined ? hlQuad : (profile.healthyQuad || 0);
    let lsi = 100;
    if (currentHl > 0 && currentOp > 0) {
      lsi = Math.round((currentOp / currentHl) * 100);
    }

    const currentPain = painScore !== undefined ? painScore : 0;
    const currentSwelling = swellingScore !== undefined ? swellingScore : 0;
    const currentFlexion = flex !== undefined ? flex : (profile.currentFlexion || 0);
    const currentExtension = ext !== undefined ? ext : 0;

    // Check exit criteria benchmarks dynamically
    if (profile.currentPhase === 1) {
      if (currentFlexion >= 110 && currentExtension <= 0 && currentSwelling <= 2 && currentPain <= 3) {
        isReadyForProgression = true;
      }
    } else if (profile.currentPhase === 2) {
      if (currentFlexion >= 120 && currentSwelling <= 2 && currentPain <= 3) {
        isReadyForProgression = true;
      }
    } else if (profile.currentPhase === 3) {
      if (lsi >= 90 && currentFlexion >= 130 && currentSwelling <= 2 && currentPain <= 2) {
        isReadyForProgression = true;
      }
    } else if (profile.currentPhase === 4) {
      if (currentSwelling <= 2 && currentPain <= 2) {
        isReadyForProgression = true;
      }
    } else if (profile.currentPhase === 5) {
      if (currentSwelling <= 2 && currentPain <= 2) {
        isReadyForProgression = true;
      }
    } else if (profile.currentPhase === 6) {
      if (currentSwelling <= 1 && currentPain <= 1) {
        isReadyForProgression = true;
      }
    } else if (profile.currentPhase === 7) {
      if (lsi >= 95 && currentSwelling <= 1 && currentPain <= 1) {
        isReadyForProgression = true;
      }
    }

    // Monitoring subjective warning thresholds and keyword alerts
    const noteText = (notes || "").toLowerCase();
    const emergencyKeywords = ["calf pain", "calf swelling", "fever", "pus", "wound drainage", "infection", "giving way", "instability", "knee collapse"];
    
    for (const keyword of emergencyKeywords) {
      if (noteText.includes(keyword)) {
        isHighRisk = true;
        triggeredFlags.push(`Reported keyword: "${keyword}"`);
      }
    }

    if (currentPain >= 8) {
      isHighRisk = true;
      triggeredFlags.push(`Critical Pain Score: ${currentPain}/10`);
    }
    if (currentSwelling >= 8) {
      isHighRisk = true;
      triggeredFlags.push(`Critical Swelling Score: ${currentSwelling}/10`);
    }

    // Save changes to profile document
    profile.readyForProgression = isReadyForProgression;
    
    const wasHighRisk = profile.highRisk;
    profile.highRisk = isHighRisk;
    await profile.save();

    if (isHighRisk && !wasHighRisk) {
      try {
        const doctor = await User.findById(profile.doctorId);
        const patientUser = await User.findById(patientId);
        if (doctor && patientUser) {
          await sendRiskAlertEmail({
            doctorEmail: doctor.email,
            doctorName: doctor.name,
            patientName: patientUser.name,
            reportedSymptoms: triggeredFlags.join(", ")
          });
        }
      } catch (emailErr) {
        console.error("Error sending emergency red flag email", emailErr);
      }
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
      readyForProgression: profile.readyForProgression,
      highRisk: profile.highRisk,
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
        debridementDate2: profile.debridementDate2,
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
