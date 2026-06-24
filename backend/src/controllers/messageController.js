import Message from '../models/Message.js';
import PatientProfile from '../models/PatientProfile.js';

export async function sendMessage(req, res) {
  try {
    const { patientId, text } = req.body;
    
    if (!text || text.trim() === '') {
      return res.status(400).json({ message: 'Message text is required' });
    }

    let doctorIdObj;
    let patientIdObj;

    if (req.user.role === 'doctor') {
      if (!patientId) {
        return res.status(400).json({ message: 'Patient ID is required' });
      }
      
      const profile = await PatientProfile.findOne({ userId: patientId });
      if (!profile) {
        return res.status(404).json({ message: 'Patient profile not found' });
      }
      if (profile.doctorId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Forbidden: You do not manage this patient' });
      }

      doctorIdObj = req.user._id;
      patientIdObj = patientId;
    } else {
      const profile = await PatientProfile.findOne({ userId: req.user._id });
      if (!profile) {
        return res.status(404).json({ message: 'Patient profile not found' });
      }

      doctorIdObj = profile.doctorId;
      patientIdObj = req.user._id;
    }

    const message = await Message.create({
      doctorId: doctorIdObj,
      patientId: patientIdObj,
      senderId: req.user._id,
      text,
      isRead: false
    });

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error sending message' });
  }
}

export async function getConversation(req, res) {
  try {
    const { patientId } = req.params;
    let doctorIdObj;
    let patientIdObj;

    if (req.user.role === 'doctor') {
      const profile = await PatientProfile.findOne({ userId: patientId });
      if (!profile) {
        return res.status(404).json({ message: 'Patient profile not found' });
      }
      if (profile.doctorId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Forbidden: You do not manage this patient' });
      }

      doctorIdObj = req.user._id;
      patientIdObj = patientId;
    } else {
      if (patientId !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Forbidden: You can only access your own conversations' });
      }

      const profile = await PatientProfile.findOne({ userId: req.user._id });
      if (!profile) {
        return res.status(404).json({ message: 'Patient profile not found' });
      }

      doctorIdObj = profile.doctorId;
      patientIdObj = req.user._id;
    }

    const messages = await Message.find({
      doctorId: doctorIdObj,
      patientId: patientIdObj
    }).sort('createdAt');

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error fetching messages' });
  }
}

export async function markAsRead(req, res) {
  try {
    const { patientId } = req.params;

    if (req.user.role === 'doctor') {
      const profile = await PatientProfile.findOne({ userId: patientId });
      if (!profile) {
        return res.status(404).json({ message: 'Patient profile not found' });
      }
      if (profile.doctorId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Forbidden: You do not manage this patient' });
      }

      // Mark messages sent by the patient (not doctor) as read
      await Message.updateMany(
        { doctorId: req.user._id, patientId, senderId: patientId, isRead: false },
        { isRead: true }
      );
    } else {
      if (patientId !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Forbidden: You can only access your own conversations' });
      }

      const profile = await PatientProfile.findOne({ userId: req.user._id });
      if (!profile) {
        return res.status(404).json({ message: 'Patient profile not found' });
      }

      // Mark messages sent by the doctor (not patient) as read
      await Message.updateMany(
        { doctorId: profile.doctorId, patientId: req.user._id, senderId: profile.doctorId, isRead: false },
        { isRead: true }
      );
    }

    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error marking messages as read' });
  }
}
