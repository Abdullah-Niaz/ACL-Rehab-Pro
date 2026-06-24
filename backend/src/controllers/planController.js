import RehabPlan from '../models/RehabPlan.js';
import PatientProfile from '../models/PatientProfile.js';

export async function createPlan(req, res) {
  try {
    const { patientId } = req.params;
    
    // Check if patient profile exists and doctor manages this patient
    const profile = await PatientProfile.findOne({ userId: patientId });
    if (!profile) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }
    if (profile.doctorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden: You do not manage this patient' });
    }

    let plan = await RehabPlan.findOne({ patientId });
    if (plan) {
      plan.phases = req.body.phases;
      await plan.save();
      return res.json(plan);
    }

    plan = await RehabPlan.create({
      patientId,
      doctorId: req.user._id,
      phases: req.body.phases
    });
    res.status(201).json(plan);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error creating plan' });
  }
}

export async function getPlan(req, res) {
  try {
    const { patientId } = req.params;
    const plan = await RehabPlan.findOne({ patientId });
    
    if (!plan) {
      return res.status(404).json({ message: 'Rehab plan not found for this patient' });
    }

    // Access control: Doctor who owns it or the Patient themselves
    if (req.user.role === 'doctor') {
      if (plan.doctorId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Forbidden: You do not manage this patient' });
      }
    } else {
      if (plan.patientId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Forbidden: This is not your plan' });
      }
    }

    res.json(plan);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error fetching plan' });
  }
}

export async function updatePlan(req, res) {
  try {
    const { patientId } = req.params;
    const plan = await RehabPlan.findOne({ patientId });

    if (!plan) {
      return res.status(404).json({ message: 'Rehab plan not found' });
    }

    // Access control: Doctor only
    if (plan.doctorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden: You do not manage this patient' });
    }

    plan.phases = req.body.phases;
    await plan.save();
    res.json(plan);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error updating plan' });
  }
}
