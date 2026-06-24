import React, { useEffect, useMemo, useState } from "react";
import Layout from "../../components/Layout";
import KpiCard from "../../components/KpiCard";
import ProgressBar from "../../components/ProgressBar";
import { TrendLine, TrendBar } from "../../components/Charts";
import api from "../../api/client";
import { quadSymmetry } from "../../utils/calculations";
import { 
  Award, Calendar, Activity, Zap, CheckCircle2, 
  ChevronRight, Sparkles, MessageCircle 
} from "lucide-react";
import { Link } from "react-router-dom";

export default function PatientDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/progress/me")
      .then((r) => {
        setData(r.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const chart = useMemo(
    () =>
      data?.logs?.map((l) => ({
        date: new Date(l.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        quad: l.measurements?.operatedQuadSize || 0,
        flexion: l.measurements?.flexion || 0,
        recovery: l.recoveryScore || 0,
      })) || [],
    [data],
  );

  const stats = useMemo(() => {
    if (!data) return null;
    const p = data.patient.profile;
    const sym = quadSymmetry(p.operatedQuadSize, p.healthyQuadSize);
    
    // Estimate RTS readiness matching surgeon scoring logic
    const rtsEstimate = Math.min(95, Math.round(sym * 0.8));

    // Get current phase details
    const activePhase = data.patient.assignedPlan?.phases?.find(
      (x) => x.phaseNumber === data.patient.currentPhase,
    );

    // Get today's exercises list
    const activeWeek = activePhase?.weeks?.find(
      (w) => w.weekNumber === data.patient.currentWeek,
    );
    const exercises = activeWeek?.exercises || [];

    return {
      sym,
      rtsEstimate,
      activePhase,
      activeWeek,
      exercises
    };
  }, [data]);

  if (loading) {
    return (
      <Layout role="patient">
        <div className="space-y-6">
          <div className="h-44 rounded-2xl skeleton-shimmer"></div>
          <div className="grid md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="h-28 rounded-2xl skeleton-shimmer"></div>
            ))}
          </div>
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="h-80 rounded-2xl skeleton-shimmer"></div>
            <div className="h-80 rounded-2xl skeleton-shimmer"></div>
          </div>
        </div>
      </Layout>
    );
  }

  const p = data.patient.profile;

  return (
    <Layout role="patient">
      {/* 1. Welcoming Hero Banner Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950 text-white rounded-3xl p-6 md:p-8 border border-slate-900 shadow-xl mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden select-none">
        {/* Glow backdrop */}
        <div className="absolute right-0 bottom-0 w-[40%] h-[120%] bg-blue-600/10 blur-[80px] rounded-full pointer-events-none"></div>

        <div className="space-y-2 relative z-10">
          <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-widest text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/15">
            <Sparkles size={10} className="animate-spin" />
            Athlete Portal
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-100">
            Welcome back, {data.patient.user?.name}!
          </h2>
          <p className="text-xs text-slate-400 max-w-md font-medium leading-relaxed">
            You are currently in <b className="text-blue-300">Phase {data.patient.currentPhase}: {stats.activePhase?.title}</b>. Keep up the consistency to restoring full quad symmetry.
          </p>
        </div>

        <Link 
          to="/patient/progress"
          className="btn-brand-primary py-3 px-6 text-white font-semibold flex items-center gap-2 relative z-10 shadow-lg shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98] transition"
        >
          <Zap size={16} />
          Log Today's Workout
        </Link>
      </div>

      {/* 2. KPI Metrics Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard
          title="Current Phase"
          value={`Phase ${data.patient.currentPhase}`}
          sub={stats.activePhase?.title}
          icon={Calendar}
        />
        <KpiCard
          title="Quad Symmetry"
          value={`${stats.sym}%`}
          sub={`${p.operatedQuadSize} / ${p.healthyQuadSize} cm`}
          trendValue="+1.1% since log"
          trendDirection="up"
          icon={Activity}
        />
        <KpiCard
          title="Knee Flexion"
          value={`${p.currentFlexion}°`}
          sub={`Target ${p.healthyFlexion}°`}
          icon={Zap}
        />
        <KpiCard
          title="Return-to-Sport readiness"
          value={`${stats.rtsEstimate}%`}
          sub="Strength + ROM estimated"
          trendValue={stats.rtsEstimate >= 90 ? "Match Ready" : "Progression Phase"}
          trendDirection="up"
          icon={Award}
        />
      </div>

      {/* 3. Return-to-Sport Progress Indicator Gauge */}
      <div className="grid lg:grid-cols-3 gap-6 mb-6 select-none">
        
        {/* RTS score details */}
        <div className="lg:col-span-2 card-premium flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-extrabold text-slate-900 text-lg">Return-To-Sport Symmetry Gauge</h3>
              <span className="text-sm font-bold text-slate-500">{stats.sym}%</span>
            </div>
            <ProgressBar value={stats.sym} />
            <p className="text-xs text-slate-500 leading-relaxed mt-3">
              Standard sports medicine criteria require <b className="text-slate-800">95%+ bilateral quadriceps and hamstrings index index symmetry</b> before returning to competitive contact football training.
            </p>
          </div>

          <div className="border-t border-slate-100 pt-4 mt-6 flex justify-between items-center text-xs">
            <span className="text-slate-500 font-semibold flex items-center gap-1">
              <CheckCircle2 size={14} className="text-emerald-500" />
              Sutures Removed
            </span>
            <span className="text-slate-400">|</span>
            <span className="text-slate-500 font-semibold flex items-center gap-1">
              <CheckCircle2 size={14} className="text-emerald-500" />
              Graft Incorporated
            </span>
            <span className="text-slate-400">|</span>
            <span className="text-slate-500 font-semibold flex items-center gap-1">
              <MessageCircle size={14} className="text-blue-500 animate-bounce" />
              Direct Surgeon Contact
            </span>
          </div>
        </div>

        {/* Today's Exercise checklist */}
        <div className="card-premium">
          <h3 className="font-bold text-slate-800 text-base mb-4 flex justify-between items-center">
            Today's Exercises
            <span className="text-xs text-slate-400 font-bold">Week {data.patient.currentWeek}</span>
          </h3>

          <div className="space-y-3 max-h-[170px] overflow-y-auto pr-1.5 custom-scrollbar">
            {stats.exercises.length === 0 ? (
              <p className="text-xs text-slate-500 italic text-center py-4">No exercises assigned for this week yet.</p>
            ) : (
              stats.exercises.map((ex, idx) => (
                <div key={idx} className="flex items-center gap-2.5 bg-slate-50 p-2.5 rounded-xl border border-slate-100/80">
                  <input 
                    type="checkbox" 
                    readOnly
                    checked={true}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500/20 accent-emerald-500 pointer-events-none"
                  />
                  <div className="overflow-hidden">
                    <span className="font-semibold text-xs text-slate-800 block truncate">{ex.name}</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mt-0.5">
                      {ex.sets}x{ex.reps} • {ex.load}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          <Link 
            to="/patient/plan" 
            className="w-full text-center text-xs font-bold text-blue-600 hover:text-blue-800 transition block mt-4 flex items-center justify-center gap-0.5"
          >
            View Full Rehab Routine
            <ChevronRight size={14} />
          </Link>
        </div>

      </div>

      {/* 4. Trends Analytics Chart */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card-premium">
          <h3 className="font-bold text-slate-800 text-base mb-4">Quad Size Recovery Curve</h3>
          <TrendLine data={chart} keyName="quad" label="Operated Quad Circumference" strokeColor="#2563EB" />
        </div>
        <div className="card-premium">
          <h3 className="font-bold text-slate-800 text-base mb-4">Daily Recovery & Sleep Score</h3>
          <TrendBar data={chart} keyName="recovery" label="Recovery Index (%)" barColor="#10B981" />
        </div>
      </div>
    </Layout>
  );
}
