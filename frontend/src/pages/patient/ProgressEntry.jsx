import React, { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import api from "../../api/client";
import { Check, ShieldCheck, HelpCircle } from "lucide-react";

export default function ProgressEntry() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    operatedQuadSize: "",
    healthyQuadSize: "",
    flexion: "",
    extension: "0",
    weight: "75",
    sleepHours: "8",
    stepCount: "5000",
    confidenceScore: "70",
    recoveryScore: "75",
    painScore: 2,
    swellingScore: 1,
    difficultyScore: 3,
    notes: ""
  });

  useEffect(() => {
    api.get("/progress/me")
      .then((r) => {
        setData(r.data);
        const p = r.data.patient.profile;
        setForm((f) => ({
          ...f,
          operatedQuadSize: p.operatedQuadSize || "",
          healthyQuadSize: p.healthyQuadSize || "",
          flexion: p.currentFlexion || "",
        }));
        setLoading(false);
      })
      .catch(err => {
        console.error("Error loading patient context", err);
        setLoading(false);
      });
  }, []);

  async function submit(e) {
    e.preventDefault();
    setMsg("");
    setError("");
    setSubmitting(true);

    try {
      await api.post("/progress", {
        patient: data.patient._id,
        phaseNumber: data.patient.currentPhase,
        weekNumber: data.patient.currentWeek,
        measurements: {
          operatedQuadSize: +form.operatedQuadSize,
          healthyQuadSize: +form.healthyQuadSize,
          flexion: +form.flexion,
          extension: +form.extension,
          weight: +form.weight,
          sleepHours: +form.sleepHours,
          stepCount: +form.stepCount,
        },
        confidenceScore: +form.confidenceScore,
        recoveryScore: +form.recoveryScore,
        exerciseLogs: [
          {
            exerciseName: "Daily Rehab Session",
            completed: true,
            painScore: +form.painScore,
            swellingScore: +form.swellingScore,
            difficultyScore: +form.difficultyScore,
            notes: form.notes,
          },
        ],
      });
      setMsg("Recovery log saved successfully!");
      setSubmitting(false);
      
      // Auto scroll to top to see success msg
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit log entry");
      setSubmitting(false);
    }
  }

  const getPainLabel = (val) => {
    if (val === 0) return "None";
    if (val <= 3) return "Mild";
    if (val <= 7) return "Moderate";
    return "Severe";
  };

  const getSwellingLabel = (val) => {
    if (val === 0) return "None";
    if (val <= 3) return "Mild (trace)";
    if (val <= 7) return "Moderate";
    return "Severe (tense)";
  };

  const getDifficultyLabel = (val) => {
    if (val <= 3) return "Easy";
    if (val <= 7) return "Challenging";
    return "Very Difficult";
  };

  if (loading) {
    return (
      <Layout role="patient">
        <p className="animate-pulse">Loading daily check-in form...</p>
      </Layout>
    );
  }

  return (
    <Layout role="patient">
      <div className="mb-6">
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Log Today's Workout</h2>
        <p className="text-xs text-slate-500 mt-1">Record your clinical stats, flexion range, swelling index, and recovery notes.</p>
      </div>

      <form onSubmit={submit} className="max-w-4xl space-y-6 select-none">
        
        {msg && (
          <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl border border-emerald-100 text-sm font-semibold flex items-center gap-2">
            <Check size={16} />
            {msg}
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-100 text-sm font-semibold">
            {error}
          </div>
        )}

        {/* Section 1: Subjective Recovery (Sliders) */}
        <div className="card-premium space-y-5">
          <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider border-b pb-2">
            1. Subjective Recovery Indicators
          </h3>

          <div className="space-y-6">
            {/* Pain Slider */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Pain Score</label>
                <span className={`text-xs font-bold rounded-lg px-2 py-0.5 ${
                  form.painScore <= 3 ? 'bg-emerald-50 text-emerald-700' : form.painScore <= 7 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'
                }`}>
                  {form.painScore}/10 ({getPainLabel(form.painScore)})
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                value={form.painScore}
                onChange={(e) => setForm({ ...form, painScore: +e.target.value })}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            {/* Swelling Slider */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Joint Swelling Score</label>
                <span className={`text-xs font-bold rounded-lg px-2 py-0.5 ${
                  form.swellingScore <= 3 ? 'bg-emerald-50 text-emerald-700' : form.swellingScore <= 7 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'
                }`}>
                  {form.swellingScore}/10 ({getSwellingLabel(form.swellingScore)})
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                value={form.swellingScore}
                onChange={(e) => setForm({ ...form, swellingScore: +e.target.value })}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            {/* Difficulty Slider */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Workout Difficulty Score</label>
                <span className={`text-xs font-bold rounded-lg px-2 py-0.5 ${
                  form.difficultyScore <= 3 ? 'bg-emerald-50 text-emerald-700' : form.difficultyScore <= 7 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'
                }`}>
                  {form.difficultyScore}/10 ({getDifficultyLabel(form.difficultyScore)})
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={form.difficultyScore}
                onChange={(e) => setForm({ ...form, difficultyScore: +e.target.value })}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Physical Measurements */}
        <div className="card-premium space-y-4">
          <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider border-b pb-2">
            2. Physical Measurements
          </h3>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="label-premium">Operated Quad Size (cm/inch)</label>
              <input
                type="number"
                step="0.1"
                required
                value={form.operatedQuadSize}
                onChange={(e) => setForm({ ...form, operatedQuadSize: e.target.value })}
                className="input-premium"
                placeholder="e.g. 20.2"
              />
            </div>

            <div>
              <label className="label-premium">Healthy Quad Size (cm/inch)</label>
              <input
                type="number"
                step="0.1"
                required
                value={form.healthyQuadSize}
                onChange={(e) => setForm({ ...form, healthyQuadSize: e.target.value })}
                className="input-premium"
                placeholder="e.g. 22.0"
              />
            </div>

            <div>
              <label className="label-premium">Current Flexion Range (deg)</label>
              <input
                type="number"
                required
                value={form.flexion}
                onChange={(e) => setForm({ ...form, flexion: e.target.value })}
                className="input-premium"
                placeholder="e.g. 135"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Lifestyle & Metadata */}
        <div className="card-premium space-y-4">
          <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider border-b pb-2">
            3. Lifestyle & Performance Stats
          </h3>
          <div className="grid sm:grid-cols-4 gap-4">
            <div>
              <label className="label-premium">Sleep Duration (hrs)</label>
              <input
                type="number"
                required
                value={form.sleepHours}
                onChange={(e) => setForm({ ...form, sleepHours: e.target.value })}
                className="input-premium"
                placeholder="e.g. 8"
              />
            </div>

            <div>
              <label className="label-premium">Step Count (daily)</label>
              <input
                type="number"
                required
                value={form.stepCount}
                onChange={(e) => setForm({ ...form, stepCount: e.target.value })}
                className="input-premium"
                placeholder="e.g. 7500"
              />
            </div>

            <div>
              <label className="label-premium">Extension Angle (deg)</label>
              <input
                type="number"
                required
                value={form.extension}
                onChange={(e) => setForm({ ...form, extension: e.target.value })}
                className="input-premium"
                placeholder="e.g. 0"
              />
            </div>

            <div>
              <label className="label-premium">Self Recovery Index (%)</label>
              <input
                type="number"
                required
                min="0"
                max="100"
                value={form.recoveryScore}
                onChange={(e) => setForm({ ...form, recoveryScore: e.target.value })}
                className="input-premium"
                placeholder="e.g. 75"
              />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="card-premium">
          <label className="label-premium">Workout Notes / Surgeon comments</label>
          <textarea
            className="input-premium h-28"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Document any clicks, locking, localized pain, or knee stability warnings during workouts..."
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="btn-brand-primary w-full py-4 flex justify-center items-center font-bold text-white shadow-lg shadow-blue-100"
        >
          {submitting ? (
            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          ) : (
            <>
              <ShieldCheck size={18} />
              Submit Daily Progress Log
            </>
          )}
        </button>

      </form>
    </Layout>
  );
}
