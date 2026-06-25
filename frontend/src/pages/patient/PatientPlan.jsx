import React, { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import api from "../../api/client";
import { 
  ChevronRight, Calendar, CheckSquare, Target, 
  AlertTriangle, PlayCircle, Star, ArrowUpRight, Check
} from "lucide-react";
import { Link } from "react-router-dom";

export default function PatientPlan() {
  const [data, setData] = useState(null);
  const [activePhaseIndex, setActivePhaseIndex] = useState(0);
  const [expandedWeekId, setExpandedWeekId] = useState(null);
  const [completedExercises, setCompletedExercises] = useState({});

  useEffect(() => {
    api.get("/progress/me").then((r) => {
      setData(r.data);
      // Auto select current phase
      const currentPhase = r.data.patient?.currentPhase || 1;
      const phases = r.data.patient?.assignedPlan?.phases || [];
      const idx = phases.findIndex(p => p.phaseNumber === currentPhase);
      if (idx !== -1) {
        setActivePhaseIndex(idx);
        // Find current week in the active phase to auto expand
        const currentWeekNum = r.data.patient?.currentWeek || 1;
        const currentWeekObj = phases[idx]?.weeks?.find(w => w.weekNumber === currentWeekNum);
        if (currentWeekObj) {
          setExpandedWeekId(currentWeekObj._id);
        } else if (phases[idx]?.weeks?.[0]) {
          setExpandedWeekId(phases[idx].weeks[0]._id);
        }
      } else if (phases[0]) {
        setActivePhaseIndex(0);
        if (phases[0].weeks?.[0]) {
          setExpandedWeekId(phases[0].weeks[0]._id);
        }
      }
    });

    // Load completed exercises from localStorage for today
    const todayStr = new Date().toISOString().split('T')[0];
    const stored = localStorage.getItem(`acl_rehab_todo_${todayStr}`);
    if (stored) {
      setCompletedExercises(JSON.parse(stored));
    }
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

  // Auto expand the first week on manual phase selection
  const handlePhaseChange = (idx) => {
    setActivePhaseIndex(idx);
    const selected = plan.phases[idx];
    if (selected && selected.weeks && selected.weeks.length > 0) {
      setExpandedWeekId(selected.weeks[0]._id);
    } else {
      setExpandedWeekId(null);
    }
  };

  const getCompletedCountForWeek = (exercises) => {
    return exercises.filter(ex => completedExercises[ex._id]).length;
  };

  const toggleExercise = (id, name, wNumber) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const isDone = completedExercises[id] || false;
    const newCompleted = {
      ...completedExercises,
      [id]: !isDone
    };
    setCompletedExercises(newCompleted);
    localStorage.setItem(`acl_rehab_todo_${todayStr}`, JSON.stringify(newCompleted));

    // Post log dynamically to backend when marking as done
    if (!isDone) {
      api.post("/progress", {
        patient: data.patient._id,
        phaseNumber: selectedPhase.phaseNumber,
        weekNumber: wNumber,
        exerciseLogs: [
          {
            exerciseId: id,
            exerciseName: name,
            completed: true,
            painScore: 0,
            swellingScore: 0,
            difficultyScore: 1,
            notes: "Logged via daily checklist"
          }
        ]
      }).catch(err => console.error("Error logging completion", err));
    }
  };

  return (
    <Layout role="patient">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tighter text-brand-ink">Rehabilitation Routine</h2>
          <p className="text-xs text-brand-mute mt-1">
            Clinic assigned plan: <span className="font-bold text-brand-charcoal">{plan.name || "ACL Return-to-Football Plan"}</span>
          </p>
        </div>
        
        <Link 
          to="/patient/progress" 
          className="btn-brand-primary py-3 px-5 text-white font-bold flex items-center gap-1.5 shadow-none self-start transition-transform hover:scale-[1.01] active:scale-[0.99]"
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
              className={`px-5 py-2.5 rounded-full font-bold text-xs whitespace-nowrap border flex-shrink-0 transition flex items-center gap-2 ${
                isSelected 
                  ? "bg-brand-ink border-brand-ink text-brand-canvas" 
                  : "bg-brand-surfaceCard border-transparent text-brand-charcoal hover:bg-brand-secondaryBg hover:text-brand-ink"
              }`}
            >
              Phase {phase.phaseNumber}
              {isCurrent && (
                <span className="h-2 w-2 rounded-full bg-brand-primary animate-ping inline-block"></span>
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
              <h3 className="font-extrabold text-brand-ink text-base tracking-tighter">
                Phase {selectedPhase.phaseNumber}: {selectedPhase.title}
              </h3>
              {selectedPhase.phaseNumber === data.patient.currentPhase && (
                <span className="rounded-full bg-brand-successPale text-brand-successDeep text-[10px] font-extrabold px-2.5 py-0.5 border border-brand-successDeep/10">Active Phase</span>
              )}
            </div>
            <p className="text-xs text-brand-mute italic">"{selectedPhase.objective}"</p>
          </div>

          <div className="space-y-3">
            {selectedPhase.weeks.map((w) => {
              const isExpanded = expandedWeekId === w._id;
              const doneCount = getCompletedCountForWeek(w.exercises);
              const totalCount = w.exercises.length;
              const completionPercent = totalCount > 0 ? (doneCount / totalCount) * 100 : 0;
              
              return (
                <div key={w._id} className="bg-brand-canvas rounded-[16px] border border-brand-hairlineSoft overflow-hidden transition-all duration-150 shadow-none">
                  {/* Collapsible header */}
                  <div 
                    onClick={() => setExpandedWeekId(isExpanded ? null : w._id)}
                    className={`p-4 flex justify-between items-center cursor-pointer hover:bg-brand-surfaceSoft/50 select-none transition-colors ${
                      isExpanded ? "bg-brand-surfaceSoft/70 border-b border-brand-hairlineSoft" : ""
                    }`}
                  >
                    <div className="flex-1 mr-4">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start md:items-center gap-2">
                        <h4 className="font-bold text-brand-ink text-sm tracking-tight">Week {w.weekNumber}: {w.focus}</h4>
                        <span className={`inline-flex self-start items-center rounded-full px-2.5 py-0.5 text-[9px] font-extrabold border tracking-wider uppercase ${
                          doneCount === totalCount && totalCount > 0
                            ? "bg-brand-successPale text-brand-successDeep border-brand-successDeep/10"
                            : "bg-brand-primary/10 text-brand-primary border-brand-primary/15"
                        }`}>
                          {doneCount} / {totalCount} completed
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-[10px] text-brand-mute font-bold uppercase tracking-wider">{totalCount} Exercises</span>
                        <div className="h-1.5 bg-brand-surfaceCard rounded-full flex-1 max-w-[120px] overflow-hidden border border-brand-hairlineSoft/40">
                          <div 
                            className="bg-brand-successDeep h-full rounded-full transition-all duration-300"
                            style={{ width: `${completionPercent}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <ChevronRight size={16} className={`text-brand-mute transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                  </div>

                  {/* Collapsed Exercise checklist pane */}
                  {isExpanded && (
                    <div className="bg-brand-surfaceSoft/30 p-4 space-y-3">
                      {w.exercises.map((ex) => {
                        const isDone = completedExercises[ex._id] || false;
                        
                        return (
                          <div 
                            key={ex._id} 
                            onClick={() => toggleExercise(ex._id, ex.name, w.weekNumber)}
                            className={`p-4 rounded-[16px] border cursor-pointer hover:scale-[1.005] active:scale-[0.995] transition-all duration-150 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 shadow-none ${
                              isDone 
                                ? "bg-brand-successPale/10 border-brand-successDeep/30" 
                                : "bg-brand-canvas border-brand-hairlineSoft hover:bg-brand-surfaceSoft/60"
                            }`}
                          >
                            <div className="flex items-center gap-3.5 flex-1 min-w-0">
                              <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all flex-shrink-0 ${
                                isDone 
                                  ? "bg-brand-successDeep border-brand-successDeep text-white" 
                                  : "border-brand-stone hover:border-brand-primary bg-brand-canvas"
                              }`}>
                                {isDone && <Check size={12} strokeWidth={3} />}
                              </div>
                              <div className="space-y-0.5 min-w-0">
                                <span className={`font-extrabold text-sm block tracking-tight ${isDone ? "line-through text-brand-mute" : "text-brand-ink"}`}>
                                  {ex.name}
                                </span>
                                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                  <span className="text-[9px] text-brand-mute font-extrabold uppercase tracking-wider bg-brand-surfaceCard px-2 py-0.5 rounded-[4px] border border-brand-hairlineSoft">
                                    {ex.category || "General"}
                                  </span>
                                </div>
                                {ex.progressionNotes && (
                                  <p className="text-brand-mute text-xs italic mt-1 block">"{ex.progressionNotes}"</p>
                                )}
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-2.5 items-center justify-between md:justify-end w-full md:w-auto">
                              <div className="flex items-center gap-1.5">
                                <span className="bg-brand-surfaceCard px-2 py-1 rounded-[8px] text-[10px] border border-brand-hairlineSoft text-brand-mute font-extrabold">
                                  {ex.sets} Sets
                                </span>
                                <span className="bg-brand-surfaceCard px-2 py-1 rounded-[8px] text-[10px] border border-brand-hairlineSoft text-brand-mute font-extrabold">
                                  {ex.reps} Reps
                                </span>
                                <span className="bg-brand-surfaceCard px-2 py-1 rounded-[8px] text-[10px] border border-brand-hairlineSoft text-brand-mute font-extrabold">
                                  {ex.load}
                                </span>
                              </div>
                              
                              <span className={`inline-block rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider border ${
                                ex.status === "Continue" ? "bg-brand-surfaceCard text-brand-charcoal border-brand-hairlineSoft" :
                                ex.status === "Progress" ? "bg-brand-successPale text-brand-successDeep border-brand-successDeep/10" :
                                ex.status === "Replace" ? "bg-amber-50 text-amber-800 border-amber-200/50" : 
                                "bg-brand-error/10 text-brand-error border-brand-error/20"
                              }`}>
                                {ex.status}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. Right column: Phase criteria checklist card */}
        <div className="space-y-6 select-none">
          <div className="card-premium bg-brand-canvas border-brand-hairlineSoft">
            <h3 className="font-extrabold text-brand-ink text-sm mb-4 uppercase tracking-wider flex items-center gap-1.5">
              <Target size={16} className="text-brand-primary" />
              Phase Gateways
            </h3>
            
            <div className="space-y-5 text-xs">
              {/* Entry Criteria */}
              <div>
                <span className="font-bold text-brand-mute uppercase tracking-widest text-[9px] block mb-2">Entry Criteria</span>
                <div className="space-y-2">
                  {selectedPhase.entryCriteria.map((c, i) => (
                    <div key={i} className="flex gap-2.5 items-start text-brand-charcoal bg-brand-surfaceSoft p-3 rounded-[16px] border border-brand-hairlineSoft">
                      <PlayCircle size={14} className="text-brand-primary mt-0.5 flex-shrink-0" />
                      <span className="font-semibold leading-relaxed">{c}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Exit Criteria */}
              <div>
                <span className="font-bold text-brand-mute uppercase tracking-widest text-[9px] block mb-2">Exit Criteria Target</span>
                <div className="space-y-2">
                  {selectedPhase.exitCriteria.map((c, i) => (
                    <div key={i} className="flex gap-2.5 items-start text-brand-charcoal bg-brand-surfaceSoft p-3 rounded-[16px] border border-brand-hairlineSoft">
                      <Star size={14} className="text-brand-successDeep mt-0.5 flex-shrink-0" />
                      <span className="font-semibold leading-relaxed">{c}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Red Flags */}
              {selectedPhase.redFlags && selectedPhase.redFlags.length > 0 && (
                <div>
                  <span className="font-bold text-brand-error uppercase tracking-widest text-[9px] block mb-2">Red Flags Alert</span>
                  <div className="space-y-2">
                    {selectedPhase.redFlags.map((c, i) => (
                      <div key={i} className="flex gap-2.5 items-start text-brand-error bg-brand-error/5 p-3 rounded-[16px] border border-brand-error/15">
                        <AlertTriangle size={14} className="text-brand-error mt-0.5 flex-shrink-0" />
                        <span className="font-semibold leading-relaxed">{c}</span>
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
