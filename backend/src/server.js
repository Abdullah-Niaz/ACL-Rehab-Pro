import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import patientRoutes from './routes/patientRoutes.js';
import planRoutes from './routes/planRoutes.js';
import progressRoutes from './routes/progressRoutes.js';
import noteRoutes from './routes/noteRoutes.js';
import doctorRoutes from './routes/doctorRoutes.js';
import inviteRoutes from './routes/inviteRoutes.js';
import messageRoutes from './routes/messageRoutes.js';

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || '*', credentials: true }));
app.use(express.json({ limit: '5mb' })); app.use(morgan('dev'));
app.get('/', (req, res) => res.json({ app: 'ACL Rehab Pro API' }));

app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/doctor', doctorRoutes);
app.use('/api/invites', inviteRoutes);
app.use('/api/messages', messageRoutes);

app.use((err, req, res, next) => { console.error(err); res.status(500).json({ message: err.message || 'Server error' }); });
const PORT = process.env.PORT || 5000;
connectDB().then(() => app.listen(PORT, () => console.log(`API running on ${PORT}`)));
