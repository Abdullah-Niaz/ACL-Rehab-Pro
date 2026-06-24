# ACL Rehab Pro

A MERN role-based ACL rehabilitation and return-to-football tracking platform for a sports surgeon/physiotherapist and patients.

## Features

- JWT authentication
- Doctor and Patient roles
- Doctor dashboard with patient analytics
- Patient dashboard with phase, progress, quad symmetry, charts
- Editable ACL rehab plan with phases, weeks, exercises, sets, reps, load, status
- Patient medical profile: graft type, graft size, surgery date, complications, flexion, quad circumference
- Progress logs: pain, swelling, difficulty, confidence, recovery score, measurements
- Return-to-sport readiness logic foundation
- Recharts analytics
- Tailwind responsive UI
- Seeded demo doctor and patient

## Stack

### Backend
- Node.js
- Express
- MongoDB
- Mongoose
- JWT
- bcryptjs

### Frontend
- React
- Vite
- Tailwind CSS
- React Router
- Axios
- Recharts
- lucide-react

## Folder Structure

```txt
acl-rehab-pro/
  backend/
    src/
      config/
      controllers/
      data/
      middleware/
      models/
      routes/
      seed/
      utils/
      server.js
  frontend/
    src/
      api/
      components/
      context/
      layouts/
      pages/
      utils/
```

## Setup

### 1. Backend env

```bash
cd backend
cp .env.example .env
```

Update `.env` if needed:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/acl_rehab_pro
JWT_SECRET=replace_this_with_a_long_secret
CLIENT_URL=http://localhost:5173
```

### 2. Frontend env

```bash
cd frontend
cp .env.example .env
```

### 3. Install dependencies

From root:

```bash
npm install
npm run install-all
```

### 4. Seed data

Make sure MongoDB is running, then:

```bash
npm run seed
```

### 5. Run app

```bash
npm run dev
```

Frontend: http://localhost:5173
Backend: http://localhost:5000

## Demo Accounts

Doctor:

```txt
doctor@aclrehabpro.com
Doctor123!
```

Patient:

```txt
patient@aclrehabpro.com
Patient123!
```

## Important Medical Disclaimer

This app is a software prototype. It does not replace direct surgeon or physiotherapist guidance. ACL rehab progression should be criterion-based and supervised by a qualified clinician, especially after wound complications, debridement, cyclops lesion, or return-to-sport progression.

## Next Production Improvements

- Add file/photo uploads with Cloudinary or S3
- Add doctor invitation flow for patients
- Add stronger role permissions per patient ownership
- Add refresh tokens
- Add automated RTS scoring form
- Add exercise video library
- Add notifications and reminders
- Add downloadable progress reports
- Add audit logs for clinical plan edits
- Add test suite
