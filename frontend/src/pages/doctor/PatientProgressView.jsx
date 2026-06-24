import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../api/client';
import { ChevronLeft, Calendar } from 'lucide-react';

export default function PatientProgressView() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/doctor/patients/${id}`)
      .then(res => {
        setPatient(res.data);
        return api.get(`/progress/patient/${res.data.userId?._id}`);
      })
      .then(res => {
        setLogs(res.data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.response?.data?.message || 'Failed to load progress data');
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <Layout role="doctor">
        <p className="animate-pulse">Loading progress logs...</p>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout role="doctor">
        <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-100 mb-4">{error}</div>
        <button onClick={() => navigate(-1)} className="btn-brand-primary">Back</button>
      </Layout>
    );
  }

  const patientName = patient?.userId?.name || 'Patient';

  return (
    <Layout role="doctor">
      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-1 text-slate-600 hover:text-slate-900 transition font-medium"
        >
          <ChevronLeft size={18} />
          Patient Details
        </button>
        <h2 className="text-2xl font-bold">
          {patientName}'s Daily Logs
        </h2>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Timeline Log Feed */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-bold text-lg text-slate-800 mb-2">Logs History ({logs.length})</h3>
          
          {logs.length === 0 ? (
            <div className="card-premium text-center py-8 text-slate-500 font-medium">
              No daily progress logs submitted yet.
            </div>
          ) : (
            logs.map(log => (
              <div key={log._id} className="card-premium hover:shadow-md transition">
                <div className="flex justify-between border-b pb-3 mb-3">
                  <div className="flex items-center gap-2 text-slate-600 font-semibold text-sm">
                    <Calendar size={16} className="text-blue-600" />
                    {new Date(log.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                  <span className="pill bg-slate-100 text-slate-600 text-xs font-semibold">
                    Phase {log.phaseNumber || patient.currentPhase} • Week {log.weekNumber || patient.currentWeek}
                  </span>
                </div>

                <div className="grid md:grid-cols-3 gap-4 text-sm mb-4">
                  <div className="bg-slate-50 p-3 rounded-xl">
                    <span className="text-xs text-slate-500 block">Flexion / Extension</span>
                    <span className="font-bold text-slate-800 text-base">
                      {log.measurements?.flexion}° / {log.measurements?.extension}°
                    </span>
                  </div>
                  
                  <div className="bg-slate-50 p-3 rounded-xl">
                    <span className="text-xs text-slate-500 block">Quad Sizes (Op / Healthy)</span>
                    <span className="font-bold text-slate-800 text-base">
                      {log.measurements?.operatedQuadSize} / {log.measurements?.healthyQuadSize}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl">
                    <span className="text-xs text-slate-500 block">Scores (Recovery / Conf)</span>
                    <span className="font-bold text-slate-800 text-base">
                      {log.recoveryScore ?? '-'}% / {log.confidenceScore ?? '-'}%
                    </span>
                  </div>
                </div>

                {log.exerciseLogs && log.exerciseLogs.length > 0 && (
                  <div className="mt-2">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Exercise Outcomes</span>
                    <div className="space-y-2">
                      {log.exerciseLogs.map((ex, idx) => (
                        <div key={idx} className="bg-blue-50/50 border border-blue-50/70 p-3 rounded-xl flex flex-col md:flex-row justify-between gap-2">
                          <div>
                            <span className="font-bold text-slate-900 block text-sm">{ex.exerciseName}</span>
                            {ex.notes && <p className="text-slate-600 text-xs mt-1 italic">"{ex.notes}"</p>}
                          </div>
                          <div className="flex gap-3 text-xs font-semibold text-slate-700 items-center">
                            <span className={`pill ${ex.completed ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                              {ex.completed ? 'Completed' : 'Missed'}
                            </span>
                            <span>Pain: <b className="text-blue-700">{ex.painScore}/10</b></span>
                            <span>Swelling: <b className="text-blue-700">{ex.swellingScore}/10</b></span>
                            <span>Diff: <b className="text-blue-700">{ex.difficultyScore}/10</b></span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Sidebar Mini Summary */}
        <div className="space-y-6">
          <div className="card-premium bg-slate-50/60 border-none shadow-none">
            <h3 className="font-bold text-lg text-slate-800 mb-3">Rehab Context</h3>
            
            <div className="space-y-3 text-sm">
              <p><span className="text-slate-500">Sport:</span> <b className="text-slate-800">{patient.sport || 'Not set'}</b></p>
              <p><span className="text-slate-500">Graft details:</span> <b className="text-slate-800">{patient.graftType} ({patient.graftSize})</b></p>
              <p>
                <span className="text-slate-500">Surgery:</span>{' '}
                <b className="text-slate-800">
                  {patient.surgeryDate ? new Date(patient.surgeryDate).toLocaleDateString() : 'N/A'}
                </b>
              </p>
              <p><span className="text-slate-500">Notes:</span> <span className="text-slate-600 block bg-white p-3 rounded-xl border border-slate-100 mt-1">{patient.notes || 'No general notes.'}</span></p>
            </div>
            
            <Link 
              className="btn-brand-primary w-full py-3 text-center block mt-4" 
              to={`/doctor/patients/${patient.userId?._id}/plan`}
            >
              Adjust Rehab Plan
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
