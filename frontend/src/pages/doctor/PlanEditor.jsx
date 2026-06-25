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
          className="flex items-center gap-1 text-brand-mute hover:text-brand-ink transition font-bold self-start"
        >
          <ChevronLeft size={18} />
          Patient Details
        </button>
        
        <div className="flex gap-2">
          <button 
            type="button"
            disabled={saving}
            onClick={save}
            className="btn-brand-primary py-2.5 px-6"
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
        <div className="bg-brand-surfaceCard rounded-md p-6 mb-6 border border-brand-hairlineSoft select-none relative overflow-hidden">
          <span className="text-[10px] font-extrabold tracking-wider text-brand-primary uppercase block mb-1">Assigned Routine Editor</span>
          <h2 className="text-2xl font-black tracking-tighter text-brand-ink">Tailoring Plan for {patient.userId?.name}</h2>
          <p className="text-xs text-brand-mute mt-1 font-medium">Graft: {patient.graftType} ({patient.graftSize}) • Current: Phase {patient.currentPhase} Week {patient.currentWeek}</p>
        </div>
      )}

      {success && (
        <div className="bg-brand-successPale text-brand-successDeep p-4 rounded-md border border-brand-successDeep/10 text-sm font-semibold mb-6">
          {success}
        </div>
      )}

      {error && (
        <div className="bg-brand-error/10 text-brand-error p-4 rounded-md border border-brand-error/20 text-sm font-semibold mb-6">
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
            className={`px-5 py-2.5 rounded-full font-bold text-xs whitespace-nowrap border transition ${
              activePhaseIndex === idx 
                ? "bg-brand-ink border-brand-ink text-white" 
                : "bg-brand-surfaceCard border-brand-hairlineSoft text-brand-mute hover:bg-brand-secondaryBg hover:text-brand-ink"
            }`}
          >
            Phase {phase.phaseNumber}: {phase.title}
          </button>
        ))}
      </div>

      {/* Week exercise tasks layout */}
      <div className="space-y-6">
        <div className="card-premium select-none">
          <span className="text-[10px] font-extrabold tracking-wider text-brand-mute uppercase block mb-1">Phase Objectives</span>
          <h3 className="font-extrabold text-brand-ink text-base tracking-tight">
            {selectedPhase?.objective || "Restore ROM and strength"}
          </h3>
        </div>

        {selectedPhase?.weeks.map((week, wi) => (
          <div key={week._id} className="card-premium space-y-4">
            <h4 className="font-extrabold text-brand-ink text-sm border-b border-brand-hairlineSoft pb-2 mb-3 tracking-tight">
              Week {week.weekNumber}: {week.focus}
            </h4>

            <div className="space-y-4">
              {week.exercises.map((ex, ei) => (
                <div 
                  key={ex._id} 
                  className="p-4 rounded-md border border-brand-hairlineSoft bg-brand-surfaceSoft/50 flex flex-col md:grid md:grid-cols-12 gap-4 items-center"
                >
                  {/* Name field */}
                  <div className="w-full md:col-span-3">
                    <label className="label-premium">Exercise Title</label>
                    <input
                      type="text"
                      className="input-premium py-2 text-xs font-bold text-brand-ink focus:bg-brand-canvas"
                      value={ex.name}
                      onChange={(e) => updateExercise(activePhaseIndex, wi, ei, "name", e.target.value)}
                    />
                  </div>

                  {/* Sets field */}
                  <div className="w-full md:col-span-1">
                    <label className="label-premium">Sets</label>
                    <input
                      type="text"
                      className="input-premium py-2 text-xs font-semibold focus:bg-brand-canvas text-brand-body"
                      value={ex.sets}
                      onChange={(e) => updateExercise(activePhaseIndex, wi, ei, "sets", e.target.value)}
                    />
                  </div>

                  {/* Reps field */}
                  <div className="w-full md:col-span-1">
                    <label className="label-premium">Reps</label>
                    <input
                      type="text"
                      className="input-premium py-2 text-xs font-semibold focus:bg-brand-canvas text-brand-body"
                      value={ex.reps}
                      onChange={(e) => updateExercise(activePhaseIndex, wi, ei, "reps", e.target.value)}
                    />
                  </div>

                  {/* Load field */}
                  <div className="w-full md:col-span-2">
                    <label className="label-premium">Load</label>
                    <input
                      type="text"
                      className="input-premium py-2 text-xs font-semibold focus:bg-brand-canvas text-brand-body"
                      value={ex.load}
                      onChange={(e) => updateExercise(activePhaseIndex, wi, ei, "load", e.target.value)}
                    />
                  </div>

                  {/* Status dropdown */}
                  <div className="w-full md:col-span-2">
                    <label className="label-premium">Status</label>
                    <select
                      className="input-premium py-2 text-xs font-bold text-brand-body bg-brand-canvas"
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
                  <div className="w-full md:col-span-3">
                    <label className="label-premium">Notes</label>
                    <input
                      type="text"
                      className="input-premium py-2 text-xs focus:bg-brand-canvas text-brand-mute"
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
