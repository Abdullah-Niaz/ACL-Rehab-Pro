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
          className="flex items-center gap-1 text-brand-mute hover:text-brand-ink transition font-bold"
        >
          <ChevronLeft size={18} />
          Patient Details
        </button>
        <h2 className="text-2xl font-extrabold text-brand-ink tracking-tighter">
          {patientName}'s Daily Logs
        </h2>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Timeline Log Feed */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-extrabold text-lg text-brand-ink mb-2 tracking-tighter">Logs History ({logs.length})</h3>
          
          {logs.length === 0 ? (
            <div className="card-premium text-center py-8 text-brand-mute font-bold shadow-none">
              No daily progress logs submitted yet.
            </div>
          ) : (
            logs.map(log => (
              <div key={log._id} className="card-premium shadow-none border-brand-hairlineSoft bg-brand-canvas transition">
                <div className="flex justify-between border-b border-brand-hairlineSoft pb-3 mb-3">
                  <div className="flex items-center gap-2 text-brand-charcoal font-bold text-sm">
                    <Calendar size={16} className="text-brand-primary" />
                    {new Date(log.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                  <span className="rounded-full bg-brand-surfaceCard text-brand-charcoal text-xs font-bold px-2.5 py-0.5 border border-brand-hairlineSoft">
                    Phase {log.phaseNumber || patient.currentPhase} • Week {log.weekNumber || patient.currentWeek}
                  </span>
                </div>

                <div className="grid md:grid-cols-3 gap-4 text-sm mb-4">
                  <div className="bg-brand-surfaceSoft p-3 rounded-[16px] border border-brand-hairlineSoft">
                    <span className="text-xs text-brand-mute block">Flexion / Extension</span>
                    <span className="font-bold text-brand-charcoal text-base">
                      {log.measurements?.flexion}° / {log.measurements?.extension}°
                    </span>
                  </div>
                  
                  <div className="bg-brand-surfaceSoft p-3 rounded-[16px] border border-brand-hairlineSoft">
                    <span className="text-xs text-brand-mute block">Quad Sizes (Op / Healthy)</span>
                    <span className="font-bold text-brand-charcoal text-base">
                      {log.measurements?.operatedQuadSize} / {log.measurements?.healthyQuadSize}
                    </span>
                  </div>

                  <div className="bg-brand-surfaceSoft p-3 rounded-[16px] border border-brand-hairlineSoft">
                    <span className="text-xs text-brand-mute block">Scores (Recovery / Conf)</span>
                    <span className="font-bold text-brand-charcoal text-base">
                      {log.recoveryScore ?? '-'}% / {log.confidenceScore ?? '-'}%
                    </span>
                  </div>
                </div>

                {log.exerciseLogs && log.exerciseLogs.length > 0 && (
                  <div className="mt-2">
                    <span className="text-xs font-bold text-brand-mute uppercase tracking-wider block mb-2">Exercise Outcomes</span>
                    <div className="space-y-2">
                      {log.exerciseLogs.map((ex, idx) => (
                        <div key={idx} className="bg-brand-primary/5 border border-brand-primary/10 p-3 rounded-[16px] flex flex-col md:flex-row justify-between gap-2">
                          <div>
                            <span className="font-bold text-brand-ink block text-sm">{ex.exerciseName}</span>
                            {ex.notes && <p className="text-brand-charcoal text-xs mt-1 italic font-semibold">"{ex.notes}"</p>}
                          </div>
                          <div className="flex gap-3 text-xs font-semibold text-brand-charcoal items-center">
                            <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold border ${ex.completed ? 'bg-brand-successPale text-brand-successDeep border-brand-successDeep/10' : 'bg-brand-error/10 text-brand-error border-brand-error/20'}`}>
                              {ex.completed ? 'Completed' : 'Missed'}
                            </span>
                            <span>Pain: <b className="text-brand-primary font-bold">{ex.painScore}/10</b></span>
                            <span>Swelling: <b className="text-brand-primary font-bold">{ex.swellingScore}/10</b></span>
                            <span>Diff: <b className="text-brand-primary font-bold">{ex.difficultyScore}/10</b></span>
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
          <div className="card-premium bg-brand-surfaceCard border border-brand-hairlineSoft shadow-none">
            <h3 className="font-extrabold text-lg text-brand-ink mb-3 tracking-tighter">Rehab Context</h3>
            
            <div className="space-y-3 text-sm font-semibold text-brand-charcoal">
              <p><span className="text-brand-mute">Sport:</span> <b className="text-brand-charcoal">{patient.sport || 'Not set'}</b></p>
              <p><span className="text-brand-mute">Graft details:</span> <b className="text-brand-charcoal">{patient.graftType} ({patient.graftSize})</b></p>
              <p>
                <span className="text-brand-mute">Surgery:</span>{' '}
                <b className="text-brand-charcoal">
                  {patient.surgeryDate ? new Date(patient.surgeryDate).toLocaleDateString() : 'N/A'}
                </b>
              </p>
              <p><span className="text-brand-mute">Notes:</span> <span className="text-brand-charcoal block bg-brand-canvas p-3 rounded-[16px] border border-brand-hairlineSoft mt-1 font-semibold">{patient.notes || 'No general notes.'}</span></p>
            </div>
            
            <Link 
              className="btn-brand-primary w-full py-3 text-center block mt-4 font-bold shadow-none" 
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
