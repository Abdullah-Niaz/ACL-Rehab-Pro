import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import api from "../../api/client";
import { ChevronLeft, Save, Sparkles, Plus, Trash2 } from "lucide-react";

export default function PlanEditor() {
  const { id } = useParams(); // patient User ID
  const navigate = useNavigate();

  const [plan, setPlan] = useState(null);
  const [patient, setPatient] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [activePhaseIndex, setActivePhaseIndex] = useState(0);

  useEffect(() => {
    // 1. Fetch patient profile details to display context
    api.get(`/doctor/patients`)
      .then(res => {
        // Find profile by patient user ID (which is id in params)
        const match = res.data.find(p => p.userId?._id === id);
        setPatient(match);
      })
      .catch(err => console.error("Error loading patient details", err));

    // 2. Fetch assigned rehab plan
    api.get(`/plans/${id}`)
      .then((r) => {
        setPlan(r.data);
      })
      .catch(err => {
        console.error("Error loading plan details", err);
        setError("Failed to load rehabilitation plan.");
      });
  }, [id]);

  if (!plan) {
    return (
      <Layout role="doctor">
        <p className="animate-pulse">Loading assigned plan...</p>
      </Layout>
    );
  }

  const updateExercise = (pi, wi, ei, key, val) => {
    const copy = structuredClone(plan);
    copy.phases[pi].weeks[wi].exercises[ei][key] = val;
    setPlan(copy);
  };

  async function save() {
    setSaving(true);
    setSuccess("");
    setError("");
    try {
      await api.put(`/plans/${id}`, plan);
      setSuccess("Rehabilitation plan updated successfully!");
      setSaving(false);
      setTimeout(() => setSuccess(""), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update plan");
      setSaving(false);
    }
  }

  const selectedPhase = plan.phases[activePhaseIndex];

  return (
    <Layout role="doctor">
      {/* Header and Save Buttons */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-1 text-slate-600 hover:text-slate-900 transition font-medium self-start"
        >
          <ChevronLeft size={18} />
          Patient Details
        </button>
        
        <div className="flex gap-2">
          <button 
            type="button"
            disabled={saving}
            onClick={save}
            className="btn-brand-primary py-2.5 px-6 text-white font-semibold flex items-center gap-2 shadow-md shadow-blue-100"
          >
            {saving ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <Save size={16} />
            )}
            {saving ? "Saving..." : "Save Plan Changes"}
          </button>
        </div>
      </div>

      {patient && (
        <div className="bg-slate-900 text-white rounded-3xl p-6 mb-6 select-none border border-slate-950 shadow-lg relative overflow-hidden">
          <div className="absolute right-0 bottom-0 w-[30%] h-[120%] bg-blue-600/10 blur-[60px] rounded-full pointer-events-none"></div>
          <span className="text-[9px] font-extrabold tracking-widest text-blue-400 uppercase block mb-1">Assigned Routine Editor</span>
          <h2 className="text-2xl font-extrabold tracking-tight">Tailoring Plan for {patient.userId?.name}</h2>
          <p className="text-xs text-slate-400 mt-1 font-medium">Graft: {patient.graftType} ({patient.graftSize}) • Current: Phase {patient.currentPhase} Week {patient.currentWeek}</p>
        </div>
      )}

      {success && (
        <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl border border-emerald-100 text-sm font-semibold mb-6">
          {success}
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-100 text-sm font-semibold mb-6">
          {error}
        </div>
      )}

      {/* Phase selectors horizontal menu */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-6 select-none custom-scrollbar">
        {plan.phases.map((phase, idx) => (
          <button
            key={phase._id}
            type="button"
            onClick={() => setActivePhaseIndex(idx)}
            className={`px-4.5 py-3.5 rounded-2xl font-bold text-xs whitespace-nowrap border transition ${
              activePhaseIndex === idx 
                ? "bg-slate-900 border-slate-900 text-white shadow-sm" 
                : "bg-white border-slate-200/80 text-slate-600 hover:bg-slate-50"
            }`}
          >
            Phase {phase.phaseNumber}: {phase.title}
          </button>
        ))}
      </div>

      {/* Week exercise tasks layout */}
      <div className="space-y-6">
        <div className="card-premium select-none">
          <h3 className="font-extrabold text-slate-800 text-base">
            Phase Objectives: {selectedPhase?.objective || "Restore ROM and strength"}
          </h3>
        </div>

        {selectedPhase?.weeks.map((week, wi) => (
          <div key={week._id} className="card-premium space-y-4">
            <h4 className="font-extrabold text-slate-800 text-sm border-b pb-2 mb-3">
              Week {week.weekNumber}: {week.focus}
            </h4>

            <div className="space-y-4">
              {week.exercises.map((ex, ei) => (
                <div 
                  key={ex._id} 
                  className="p-4 rounded-2xl border border-slate-100/80 bg-slate-50/30 flex flex-col md:grid md:grid-cols-12 gap-4 items-center"
                >
                  {/* Name field */}
                  <div className="w-full md:col-span-3">
                    <label className="label-premium">Exercise Title</label>
                    <input
                      type="text"
                      className="input-premium py-2 text-xs font-bold text-slate-800 focus:bg-white"
                      value={ex.name}
                      onChange={(e) => updateExercise(activePhaseIndex, wi, ei, "name", e.target.value)}
                    />
                  </div>

                  {/* Sets field */}
                  <div className="w-full md:col-span-1.5">
                    <label className="label-premium">Sets</label>
                    <input
                      type="text"
                      className="input-premium py-2 text-xs font-semibold focus:bg-white"
                      value={ex.sets}
                      onChange={(e) => updateExercise(activePhaseIndex, wi, ei, "sets", e.target.value)}
                    />
                  </div>

                  {/* Reps field */}
                  <div className="w-full md:col-span-1.5">
                    <label className="label-premium">Reps</label>
                    <input
                      type="text"
                      className="input-premium py-2 text-xs font-semibold focus:bg-white"
                      value={ex.reps}
                      onChange={(e) => updateExercise(activePhaseIndex, wi, ei, "reps", e.target.value)}
                    />
                  </div>

                  {/* Load field */}
                  <div className="w-full md:col-span-2">
                    <label className="label-premium">Load</label>
                    <input
                      type="text"
                      className="input-premium py-2 text-xs font-semibold focus:bg-white"
                      value={ex.load}
                      onChange={(e) => updateExercise(activePhaseIndex, wi, ei, "load", e.target.value)}
                    />
                  </div>

                  {/* Status dropdown */}
                  <div className="w-full md:col-span-2">
                    <label className="label-premium">Status</label>
                    <select
                      className="input-premium py-2 text-xs font-bold text-slate-700 bg-white"
                      value={ex.status}
                      onChange={(e) => updateExercise(activePhaseIndex, wi, ei, "status", e.target.value)}
                    >
                      <option value="Continue">Continue</option>
                      <option value="Progress">Progress</option>
                      <option value="Replace">Replace</option>
                      <option value="Remove">Remove</option>
                    </select>
                  </div>

                  {/* Notes field */}
                  <div className="w-full md:col-span-2">
                    <label className="label-premium">Notes</label>
                    <input
                      type="text"
                      className="input-premium py-2 text-xs focus:bg-white text-slate-600"
                      value={ex.progressionNotes || ""}
                      onChange={(e) => updateExercise(activePhaseIndex, wi, ei, "progressionNotes", e.target.value)}
                      placeholder="Add progression criteria..."
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
}
