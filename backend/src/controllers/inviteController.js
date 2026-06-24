import User from '../models/User.js';
import { signToken } from '../utils/token.js';

export async function verifyToken(req, res) {
  try {
    const { token } = req.params;
    const user = await User.findOne({
      inviteToken: token,
      inviteTokenExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invitation token is invalid or has expired' });
    }

    res.json({ name: user.name, email: user.email });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error verifying token' });
  }
}

export async function acceptInvite(req, res) {
  try {
    const { token, password } = req.body;
    
    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const user = await User.findOne({
      inviteToken: token,
      inviteTokenExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invitation token is invalid or has expired' });
    }

    user.password = password;
    user.isActive = true;
    user.inviteToken = undefined;
    user.inviteTokenExpires = undefined;
    await user.save();

    res.json({
      token: signToken(user),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error accepting invitation' });
  }
}
