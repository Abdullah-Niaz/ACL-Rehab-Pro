import React, { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import api from "../../api/client";
import { 
  ChevronRight, Calendar, CheckSquare, Target, 
  AlertTriangle, PlayCircle, Star, ArrowUpRight 
} from "lucide-react";
import { Link } from "react-router-dom";

export default function PatientPlan() {
  const [data, setData] = useState(null);
  const [activePhaseIndex, setActivePhaseIndex] = useState(0);
  const [expandedWeekId, setExpandedWeekId] = useState(null);

  useEffect(() => {
    api.get("/progress/me").then((r) => {
      setData(r.data);
      // Auto select current phase
      const currentPhase = r.data.patient?.currentPhase || 1;
      const phases = r.data.patient?.assignedPlan?.phases || [];
      const idx = phases.findIndex(p => p.phaseNumber === currentPhase);
      if (idx !== -1) setActivePhaseIndex(idx);
    });
  }, []);

  if (!data) {
    return (
      <Layout role="patient">
        <p className="animate-pulse">Loading assigned rehab plan...</p>
      </Layout>
    );
  }

  const plan = data.patient.assignedPlan;
  if (!plan || !plan.phases || plan.phases.length === 0) {
    return (
      <Layout role="patient">
        <div className="card-premium text-center py-12 text-slate-500 font-medium">
          No rehabilitation plan has been assigned to your profile yet.
        </div>
      </Layout>
    );
  }

  const selectedPhase = plan.phases[activePhaseIndex];

  // Auto expand the active week on selection
  const handlePhaseChange = (idx) => {
    setActivePhaseIndex(idx);
    setExpandedWeekId(null);
  };

  return (
    <Layout role="patient">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Rehabilitation Routine</h2>
          <p className="text-xs text-slate-500 mt-1">
            Clinic assigned plan: <span className="font-bold text-slate-700">{plan.name || "ACL Return-to-Football Plan"}</span>
          </p>
        </div>
        
        <Link 
          to="/patient/progress" 
          className="btn-brand-primary py-3 px-5 text-white font-semibold flex items-center gap-1.5 shadow-md shadow-blue-100 self-start"
        >
          <CheckSquare size={16} />
          Log Progress
        </Link>
      </div>

      {/* 1. Horizontal Phase Selector Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-6 select-none custom-scrollbar">
        {plan.phases.map((phase, idx) => {
          const isSelected = activePhaseIndex === idx;
          const isCurrent = phase.phaseNumber === data.patient.currentPhase;
          
          return (
            <button
              key={phase._id}
              onClick={() => handlePhaseChange(idx)}
              className={`px-4.5 py-3.5 rounded-2xl font-bold text-xs whitespace-nowrap border flex-shrink-0 transition flex items-center gap-2 ${
                isSelected 
                  ? "bg-slate-900 border-slate-900 text-white shadow-sm" 
                  : "bg-white border-slate-200/80 text-slate-600 hover:bg-slate-50 hover:text-slate-800"
              }`}
            >
              Phase {phase.phaseNumber}
              {isCurrent && (
                <span className="h-2 w-2 rounded-full bg-blue-500 animate-ping inline-block"></span>
              )}
            </button>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 items-start">
        
        {/* 2. Left / Center column: Weeks Selector & Exercises Task Layout */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card-premium select-none">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-extrabold text-slate-800 text-base">
                Phase {selectedPhase.phaseNumber}: {selectedPhase.title}
              </h3>
              {selectedPhase.phaseNumber === data.patient.currentPhase && (
                <span className="badge-info text-[9px] uppercase font-extrabold">Active Phase</span>
              )}
            </div>
            <p className="text-xs text-slate-500 italic">"{selectedPhase.objective}"</p>
          </div>

          <div className="space-y-3">
            {selectedPhase.weeks.map((w) => {
              const isExpanded = expandedWeekId === w._id;
              
              return (
                <div key={w._id} className="bg-white rounded-2xl border border-slate-200/60 shadow-soft overflow-hidden transition duration-150">
                  {/* Collapsible header */}
                  <div 
                    onClick={() => setExpandedWeekId(isExpanded ? null : w._id)}
                    className="p-4 flex justify-between items-center cursor-pointer hover:bg-slate-50/50 select-none"
                  >
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">Week {w.weekNumber}: {w.focus}</h4>
                      <span className="text-[10px] text-slate-400 font-semibold">{w.exercises.length} Exercises assigned</span>
                    </div>
                    <ChevronRight size={16} className={`text-slate-400 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                  </div>

                  {/* Collapsed Exercise checklist pane */}
                  {isExpanded && (
                    <div className="bg-slate-50/30 border-t border-slate-100 p-4 space-y-3">
                      {w.exercises.map((ex) => (
                        <div key={ex._id} className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-soft hover:shadow-md transition flex flex-col md:flex-row justify-between gap-3">
                          <div className="space-y-1">
                            <span className="font-extrabold text-slate-900 text-sm block">{ex.name}</span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                              Category: {ex.category || "General"}
                            </span>
                            {ex.progressionNotes && (
                              <p className="text-slate-500 text-xs italic mt-1">"{ex.progressionNotes}"</p>
                            )}
                          </div>

                          <div className="flex gap-4 text-xs font-semibold text-slate-700 items-center justify-between md:justify-end">
                            <div className="flex gap-4 text-slate-500 text-xs">
                              <span>Sets: <b className="text-slate-800 font-bold">{ex.sets}</b></span>
                              <span>Reps: <b className="text-slate-800 font-bold">{ex.reps}</b></span>
                              <span>Load: <b className="text-slate-800 font-bold">{ex.load}</b></span>
                            </div>
                            
                            <span className={`inline-block rounded-lg px-2 py-0.5 text-[10px] font-bold ${
                              ex.status === "Continue" ? "bg-slate-100 text-slate-700" :
                              ex.status === "Progress" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                              ex.status === "Replace" ? "bg-amber-50 text-amber-700 border border-amber-100" : "bg-red-50 text-red-700"
                            }`}>
                              {ex.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. Right column: Phase criteria checklist card */}
        <div className="space-y-6 select-none">
          <div className="card-premium bg-slate-50/60 border-none">
            <h3 className="font-extrabold text-slate-800 text-sm mb-4 uppercase tracking-wider flex items-center gap-1.5">
              <Target size={16} className="text-blue-600" />
              Phase Gateways
            </h3>
            
            <div className="space-y-4 text-xs">
              {/* Entry Criteria */}
              <div>
                <span className="font-bold text-slate-400 uppercase tracking-widest text-[9px] block mb-2">Entry Criteria</span>
                <div className="space-y-2">
                  {selectedPhase.entryCriteria.map((c, i) => (
                    <div key={i} className="flex gap-2 items-start text-slate-600 bg-white p-2.5 rounded-xl border border-slate-100 shadow-sm">
                      <PlayCircle size={14} className="text-blue-500 mt-0.5 flex-shrink-0" />
                      <span className="font-medium leading-relaxed">{c}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Exit Criteria */}
              <div>
                <span className="font-bold text-slate-400 uppercase tracking-widest text-[9px] block mb-2">Exit Criteria Target</span>
                <div className="space-y-2">
                  {selectedPhase.exitCriteria.map((c, i) => (
                    <div key={i} className="flex gap-2 items-start text-slate-600 bg-white p-2.5 rounded-xl border border-slate-100 shadow-sm">
                      <Star size={14} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span className="font-medium leading-relaxed">{c}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Red Flags */}
              {selectedPhase.redFlags && selectedPhase.redFlags.length > 0 && (
                <div>
                  <span className="font-bold text-red-500/80 uppercase tracking-widest text-[9px] block mb-2">Red Flags Alert</span>
                  <div className="space-y-2">
                    {selectedPhase.redFlags.map((c, i) => (
                      <div key={i} className="flex gap-2 items-start text-red-700 bg-red-50/50 p-2.5 rounded-xl border border-red-100/50">
                        <AlertTriangle size={14} className="text-red-500 mt-0.5 flex-shrink-0" />
                        <span className="font-medium leading-relaxed">{c}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </Layout>
  );
}
