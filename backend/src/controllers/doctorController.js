import crypto from 'crypto';
import User from '../models/User.js';
import PatientProfile from '../models/PatientProfile.js';
import RehabPlan from '../models/RehabPlan.js';
import ProgressLog from '../models/ProgressLog.js';
import Message from '../models/Message.js';
import ClinicalNote from '../models/ClinicalNote.js';
import { defaultAclPlan, normalizePlan } from '../data/defaultPlan.js';
import { sendInviteEmail } from '../utils/email.js';

export async function createPatient(req, res) {
  try {
    const {
      name,
      email,
      age,
      gender,
      sport,
      surgeryDate,
      graftType,
      graftSize,
      tunnelPlacement,
      complications,
      debridementDate,
      suturesRemovalDate,
      currentFlexion = 0,
      healthyFlexion = 150,
      operatedQuad = 0,
      healthyQuad = 0,
      notes
    } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required' });
    }

    const emailNormalized = email.toLowerCase().trim();
    const exists = await User.findOne({ email: emailNormalized });
    if (exists) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Generate random password and verification invite token
    const tempPassword = crypto.randomBytes(16).toString('hex');
    const inviteToken = crypto.randomBytes(32).toString('hex');
    const inviteTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    const user = await User.create({
      name,
      email: emailNormalized,
      password: tempPassword,
      role: 'patient',
      isActive: false,
      inviteToken,
      inviteTokenExpires
    });

    const profile = await PatientProfile.create({
      userId: user._id,
      doctorId: req.user._id,
      age,
      gender,
      sport,
      surgeryDate,
      graftType,
      graftSize,
      tunnelPlacement,
      complications,
      debridementDate,
      suturesRemovalDate,
      currentFlexion,
      healthyFlexion,
      operatedQuad,
      healthyQuad,
      notes
    });

    // Create a duplicated copy of default rehabilitation plan
    const planPhases = normalizePlan(defaultAclPlan).phases;
    await RehabPlan.create({
      patientId: user._id,
      doctorId: req.user._id,
      phases: planPhases
    });

    // Deliver email invitation asynchronously
    await sendInviteEmail({
      email: user.email,
      name: user.name,
      token: inviteToken
    });

    res.status(201).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isActive: user.isActive
      },
      profile
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error creating patient' });
  }
}

export async function getPatients(req, res) {
  try {
    const profiles = await PatientProfile.find({ doctorId: req.user._id })
      .populate('userId', 'name email role isActive')
      .sort('-createdAt');
      
    const profilesWithUnread = await Promise.all(profiles.map(async (p) => {
      const count = await Message.countDocuments({
        patientId: p.userId?._id,
        doctorId: req.user._id,
        senderId: p.userId?._id,
        isRead: false
      });
      
      const pObj = p.toObject();
      pObj.unreadMessagesCount = count;
      return pObj;
    }));

    res.json(profilesWithUnread);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error fetching patients' });
  }
}

export async function getPatient(req, res) {
  try {
    const profile = await PatientProfile.findById(req.params.id)
      .populate('userId', 'name email role isActive');
      
    if (!profile) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }

    if (profile.doctorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden: You do not manage this patient' });
    }

    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error fetching patient details' });
  }
}

export async function updatePatient(req, res) {
  try {
    const profile = await PatientProfile.findById(req.params.id);
    if (!profile) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }

    if (profile.doctorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden: You do not manage this patient' });
    }

    const { name, email, ...profileFields } = req.body;

    if (name || email) {
      const user = await User.findById(profile.userId);
      if (user) {
        if (name) user.name = name;
        if (email) user.email = email.toLowerCase().trim();
        await user.save();
      }
    }

    // Update patient profile details
    Object.assign(profile, profileFields);
    await profile.save();

    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error updating patient profile' });
  }
}

export async function deletePatient(req, res) {
  try {
    const profile = await PatientProfile.findById(req.params.id);
    if (!profile) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }

    if (profile.doctorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden: You do not manage this patient' });
    }

    const patientUserId = profile.userId;

    // Remove patient details across all tables
    await PatientProfile.findByIdAndDelete(req.params.id);
    await User.findByIdAndDelete(patientUserId);
    await RehabPlan.deleteMany({ patientId: patientUserId });
    await ProgressLog.deleteMany({ patientId: patientUserId });
    await Message.deleteMany({ patientId: patientUserId });
    await ClinicalNote.deleteMany({ patient: req.params.id });

    res.json({ message: 'Patient deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error deleting patient' });
  }
}
