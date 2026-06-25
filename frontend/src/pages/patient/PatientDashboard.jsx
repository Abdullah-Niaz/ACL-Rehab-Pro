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
      <div className="bg-brand-surfaceCard rounded-[32px] p-6 md:p-8 border border-brand-hairlineSoft mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden select-none">
        <div className="space-y-2 relative z-10">
          <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-widest text-brand-primary bg-brand-primary/10 px-3 py-1 rounded-full border border-brand-primary/15">
            <Sparkles size={10} />
            Athlete Portal
          </span>
          <h2 className="text-3xl font-extrabold tracking-tighter text-brand-ink">
            Welcome back, {data.patient.user?.name}!
          </h2>
          <p className="text-xs text-brand-charcoal max-w-md font-semibold leading-relaxed">
            You are currently in <span className="text-brand-primary font-bold">Phase {data.patient.currentPhase}: {stats.activePhase?.title}</span>. Keep up the consistency to restoring full quad symmetry.
          </p>
        </div>

        <Link 
          to="/patient/progress"
          className="btn-brand-primary py-3 px-6 text-white font-bold flex items-center gap-2 relative z-10 shadow-none hover:scale-[1.01] active:scale-[0.99] transition"
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
              <h3 className="font-extrabold text-brand-ink text-lg tracking-tighter">Return-To-Sport Symmetry Gauge</h3>
              <span className="text-sm font-bold text-brand-mute">{stats.sym}%</span>
            </div>
            <ProgressBar value={stats.sym} />
            <p className="text-xs text-brand-mute leading-relaxed mt-3">
              Standard sports medicine criteria require <b className="text-brand-charcoal">95%+ bilateral quadriceps and hamstrings index symmetry</b> before returning to competitive contact football training.
            </p>
          </div>

          <div className="border-t border-brand-hairlineSoft pt-4 mt-6 flex justify-between items-center text-xs">
            <span className="text-brand-mute font-bold flex items-center gap-1">
              <CheckCircle2 size={14} className="text-brand-successDeep" />
              Sutures Removed
            </span>
            <span className="text-brand-stone">|</span>
            <span className="text-brand-mute font-bold flex items-center gap-1">
              <CheckCircle2 size={14} className="text-brand-successDeep" />
              Graft Incorporated
            </span>
            <span className="text-brand-stone">|</span>
            <span className="text-brand-mute font-bold flex items-center gap-1">
              <MessageCircle size={14} className="text-brand-primary" />
              Direct Surgeon Contact
            </span>
          </div>
        </div>

        {/* Today's Exercise checklist */}
        <div className="card-premium">
          <h3 className="font-bold text-brand-ink text-base mb-4 flex justify-between items-center tracking-tight">
            Today's Exercises
            <span className="text-xs text-brand-mute font-bold">Week {data.patient.currentWeek}</span>
          </h3>

          <div className="space-y-3 max-h-[170px] overflow-y-auto pr-1.5 custom-scrollbar">
            {stats.exercises.length === 0 ? (
              <p className="text-xs text-brand-mute italic text-center py-4">No exercises assigned for this week yet.</p>
            ) : (
              stats.exercises.map((ex, idx) => (
                <div key={idx} className="flex items-center gap-2.5 bg-brand-surfaceSoft p-2.5 rounded-[16px] border border-brand-hairlineSoft">
                  <input 
                    type="checkbox" 
                    readOnly
                    checked={true}
                    className="w-4 h-4 rounded text-brand-primary focus:ring-brand-focusOuter/20 accent-brand-primary pointer-events-none"
                  />
                  <div className="overflow-hidden">
                    <span className="font-semibold text-xs text-brand-charcoal block truncate">{ex.name}</span>
                    <span className="text-[10px] text-brand-mute font-bold uppercase tracking-wider block mt-0.5">
                      {ex.sets}x{ex.reps} • {ex.load}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          <Link 
            to="/patient/plan" 
            className="w-full text-center text-xs font-bold text-brand-primary hover:text-brand-primaryPressed transition block mt-4 flex items-center justify-center gap-0.5"
          >
            View Full Rehab Routine
            <ChevronRight size={14} />
          </Link>
        </div>

      </div>

      {/* 4. Trends Analytics Chart */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card-premium">
          <h3 className="font-bold text-brand-ink text-base mb-4 tracking-tight">Quad Size Recovery Curve</h3>
          <TrendLine data={chart} keyName="quad" label="Operated Quad Circumference" strokeColor="#e60023" />
        </div>
        <div className="card-premium">
          <h3 className="font-bold text-brand-ink text-base mb-4 tracking-tight">Daily Recovery & Sleep Score</h3>
          <TrendBar data={chart} keyName="recovery" label="Recovery Index (%)" barColor="#103c25" />
        </div>
      </div>
    </Layout>
  );
}
