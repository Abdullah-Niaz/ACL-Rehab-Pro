import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import './styles.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/auth/Login';
import InviteAccept from './pages/auth/InviteAccept';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import Patients from './pages/doctor/Patients';
import PatientDetail from './pages/doctor/PatientDetail';
import PlanEditor from './pages/doctor/PlanEditor';
import PatientForm from './pages/doctor/PatientForm';
import PatientProgressView from './pages/doctor/PatientProgressView';
import DoctorMessages from './pages/doctor/DoctorMessages';

import PatientDashboard from './pages/patient/PatientDashboard';
import PatientPlan from './pages/patient/PatientPlan';
import ProgressEntry from './pages/patient/ProgressEntry';
import PatientMessages from './pages/patient/PatientMessages';
import PatientMeasurements from './pages/patient/PatientMeasurements';
import PatientProfileView from './pages/patient/PatientProfileView';
import DoctorAnalytics from './pages/doctor/DoctorAnalytics';
import DoctorSettings from './pages/doctor/DoctorSettings';

function Protected({role,children}){
  const {user}=useAuth(); 
  if(!user) return <Navigate to="/login"/>; 
  if(role && user.role!==role) return <Navigate to={user.role==='doctor'?'/doctor':'/patient'}/>; 
  return children;
}

function Home(){
  const {user}=useAuth(); 
  if(!user) return <Navigate to="/login"/>; 
  return <Navigate to={user.role==='doctor'?'/doctor':'/patient'}/>
}

createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login/>}/>
        <Route path="/accept-invite/:token" element={<InviteAccept/>}/>
        <Route path="/" element={<Home/>}/>
        
        {/* Doctor Routes */}
        <Route path="/doctor" element={<Protected role="doctor"><DoctorDashboard/></Protected>}/>
        <Route path="/doctor/dashboard" element={<Protected role="doctor"><DoctorDashboard/></Protected>}/>
        <Route path="/doctor/patients" element={<Protected role="doctor"><Patients/></Protected>}/>
        <Route path="/doctor/patients/new" element={<Protected role="doctor"><PatientForm/></Protected>}/>
        <Route path="/doctor/patients/:id" element={<Protected role="doctor"><PatientDetail/></Protected>}/>
        <Route path="/doctor/patients/:id/edit" element={<Protected role="doctor"><PatientForm/></Protected>}/>
        <Route path="/doctor/patients/:id/progress" element={<Protected role="doctor"><PatientProgressView/></Protected>}/>
        <Route path="/doctor/patients/:id/plan" element={<Protected role="doctor"><PlanEditor/></Protected>}/>
        <Route path="/doctor/plans/:id" element={<Protected role="doctor"><PlanEditor/></Protected>}/>
        <Route path="/doctor/messages/:patientId" element={<Protected role="doctor"><DoctorMessages/></Protected>}/>
        
        {/* Patient Routes */}
        <Route path="/patient" element={<Protected role="patient"><PatientDashboard/></Protected>}/>
        <Route path="/patient/dashboard" element={<Protected role="patient"><PatientDashboard/></Protected>}/>
        <Route path="/patient/plan" element={<Protected role="patient"><PatientPlan/></Protected>}/>
        <Route path="/patient/progress" element={<Protected role="patient"><ProgressEntry/></Protected>}/>
        <Route path="/patient/log" element={<Protected role="patient"><ProgressEntry/></Protected>}/>
        <Route path="/patient/measurements" element={<Protected role="patient"><PatientMeasurements/></Protected>}/>
        <Route path="/patient/messages" element={<Protected role="patient"><PatientMessages/></Protected>}/>
        <Route path="/patient/profile" element={<Protected role="patient"><PatientProfileView/></Protected>}/>
        <Route path="/doctor/analytics" element={<Protected role="doctor"><DoctorAnalytics/></Protected>}/>
        <Route path="/doctor/settings" element={<Protected role="doctor"><DoctorSettings/></Protected>}/>
      </Routes>
    </BrowserRouter>
  </AuthProvider>
);
