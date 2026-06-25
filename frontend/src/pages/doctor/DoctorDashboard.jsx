import React, { useEffect, useMemo, useState } from "react";
import Layout from "../../components/Layout";
import KpiCard from "../../components/KpiCard";
import { TrendLine, TrendBar } from "../../components/Charts";
import api from "../../api/client";
import { quadSymmetry } from "../../utils/calculations";
import { 
  Users, AlertCircle, ShieldCheck, Activity, 
  Calendar, Clock, CheckCircle2, ChevronRight 
} from "lucide-react";
import { Link } from "react-router-dom";

export default function DoctorDashboard() {
  const [data, setData] = useState({ patients: [], logs: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/patients/dashboard/summary")
      .then((r) => {
        setData(r.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  // Compute Clinical Analytics on the fly
  const stats = useMemo(() => {
    const patients = data.patients || [];
    const logs = data.logs || [];

    const total = patients.length;
    
    // High risk: prioritize database-driven p.highRisk, fallback to active scar tissue OR quad symmetry < 75%
    const highRisk = patients.filter(p => {
      if (p.highRisk !== undefined && p.highRisk !== null) return p.highRisk;
      if (p.profile?.highRisk !== undefined && p.profile?.highRisk !== null) return p.profile.highRisk;
      const sym = quadSymmetry(p.profile?.operatedQuadSize, p.profile?.healthyQuadSize);
      const hasComplication = p.profile?.complications && p.profile.complications.toLowerCase().trim() !== "";
      return sym < 75 || hasComplication;
    });

    // Ready for progression: check if flagged ready in database
    const readyList = patients.filter(p => p.readyForProgression || p.profile?.readyForProgression);

    // Average Quad Symmetry of all clinic patients
    const avgSymmetry = Math.round(
      patients.reduce((acc, curr) => {
        return acc + quadSymmetry(curr.profile?.operatedQuadSize, curr.profile?.healthyQuadSize);
      }, 0) / (total || 1)
    );

    // Compliance Rate: percentage of exercise logs marked completed
    const completedExercises = logs.reduce((acc, curr) => {
      const exerciseLogs = curr.exerciseLogs || [];
      const completedCount = exerciseLogs.filter(e => e.completed).length;
      return acc + (completedCount > 0 ? 1 : 0);
    }, 0);
    const complianceRate = Math.round((completedExercises / (logs.length || 1)) * 100);

    return {
      total,
      highRiskCount: highRisk.length,
      highRiskList: highRisk,
      readyCount: readyList.length,
      readyList,
      avgSymmetry,
      complianceRate
    };
  }, [data]);

  const chartData = useMemo(
    () =>
      data.logs.map((l) => ({
        date: new Date(l.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        quad: l.measurements?.operatedQuadSize || 0,
        flexion: l.measurements?.flexion || 0,
        recovery: l.recoveryScore || 0,
      })),
    [data],
  );

  // Sorting recent activity logs
  const recentActivities = useMemo(() => {
    return [...data.logs]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
  }, [data]);

  if (loading) {
    return (
      <Layout role="doctor">
        <div className="space-y-6">
          <div className="grid md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="h-28 rounded-2xl skeleton-shimmer"></div>
            ))}
          </div>
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-96 rounded-2xl skeleton-shimmer"></div>
            <div className="h-96 rounded-2xl skeleton-shimmer"></div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout role="doctor">
      {/* 1. Metric Grid Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard 
          title="Total Patients" 
          value={stats.total} 
          sub="Active monitoring"
          icon={Users}
        />
        <KpiCard 
          title="Avg Quad Symmetry" 
          value={`${stats.avgSymmetry}%`} 
          sub="Clinic benchmark"
          trendValue="+1.2%"
          trendDirection="up"
          icon={Activity}
        />
        <KpiCard 
          title="High Risk Alerts" 
          value={stats.highRiskCount} 
          sub="Needs clinical review"
          trendValue={stats.highRiskCount > 0 ? "Attention Required" : "All Clear"}
          trendDirection={stats.highRiskCount > 0 ? "down" : "up"}
          icon={AlertCircle}
        />
        <KpiCard 
          title="Log Compliance" 
          value={`${stats.complianceRate}%`} 
          sub="Weekly log submission"
          trendValue="95% target"
          trendDirection="up"
          icon={ShieldCheck}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* 2. Recovery Graphs Dashboard */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card-premium">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-extrabold text-brand-ink text-lg tracking-tighter">Flexion & ROM Progress Curves</h3>
                <p className="text-xs text-brand-mute">Aggregated historical metrics from patients logs.</p>
              </div>
            </div>
            <TrendLine data={chartData} keyName="flexion" label="Knee Flexion" strokeColor="#e60023" />
          </div>

          <div className="card-premium">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-extrabold text-brand-ink text-lg tracking-tighter">Daily Recovery Trends</h3>
                <p className="text-xs text-brand-mute">Logs scoring metrics representing average confidence.</p>
              </div>
            </div>
            <TrendBar data={chartData} keyName="recovery" label="Recovery Score" barColor="#103c25" />
          </div>
        </div>

        {/* 3. Right Sidebar Alerts & Activity Timeline */}
        <div className="space-y-6">
          {/* Risk Alerts panel */}
          {stats.highRiskCount > 0 && (
            <div className="card-premium border-brand-error/20 bg-brand-error/5 shadow-none">
              <h3 className="font-bold text-brand-error text-sm uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <AlertCircle size={16} />
                High Risk Alerts
              </h3>
              <div className="space-y-2.5">
                {stats.highRiskList.map(p => (
                  <Link 
                    key={p._id} 
                    to={`/doctor/patients/${p._id}`}
                    className="flex justify-between items-center bg-brand-canvas p-3 rounded-[16px] border border-brand-error/15 hover:border-brand-error/40 transition shadow-none"
                  >
                    <div>
                      <p className="font-bold text-xs text-brand-ink">{p.user?.name}</p>
                      <span className="text-[10px] text-brand-mute block truncate max-w-[160px] font-semibold mt-0.5">
                        {p.profile?.complications || `Low symmetry (${quadSymmetry(p.profile?.operatedQuadSize, p.profile?.healthyQuadSize)}%)`}
                      </span>
                    </div>
                    <ChevronRight size={14} className="text-brand-error" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Promotion Eligibility panel */}
          {stats.readyCount > 0 && (
            <div className="card-premium border-brand-successDeep/20 bg-brand-successPale/10 shadow-none">
              <h3 className="font-bold text-brand-successDeep text-sm uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-brand-successDeep" />
                Eligible for Promotion
              </h3>
              <div className="space-y-2.5">
                {stats.readyList.map(p => (
                  <Link 
                    key={p._id} 
                    to={`/doctor/patients/${p._id}`}
                    className="flex justify-between items-center bg-brand-canvas p-3 rounded-[16px] border border-brand-successDeep/15 hover:border-brand-successDeep/40 transition shadow-none"
                  >
                    <div>
                      <p className="font-bold text-xs text-brand-ink">{p.user?.name}</p>
                      <span className="text-[10px] text-brand-mute block truncate max-w-[160px] font-semibold mt-0.5">
                        Phase {p.currentPhase} → Phase {p.currentPhase + 1}
                      </span>
                    </div>
                    <ChevronRight size={14} className="text-brand-successDeep" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Activity feed timeline */}
          <div className="card-premium">
            <h3 className="font-bold text-brand-ink text-sm mb-4 uppercase tracking-wider">
              Recent Patient Check-ins
            </h3>
            
            {recentActivities.length === 0 ? (
              <p className="text-xs text-brand-mute italic">No check-in logs submitted today.</p>
            ) : (
              <div className="relative pl-4 border-l border-brand-hairlineSoft space-y-5">
                {recentActivities.map((log) => {
                  const logPatient = data.patients.find(p => p.user?._id === log.patientId);
                  return (
                    <div key={log._id} className="relative text-xs select-none">
                      {/* Timeline dot */}
                      <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-brand-primary ring-4 ring-brand-canvas"></span>
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-brand-charcoal flex items-center gap-1.5">
                            {logPatient?.user?.name || "Patient"}
                            {logPatient?.highRisk && (
                              <span className="inline-flex items-center rounded-full bg-brand-error/10 text-brand-error text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 border border-brand-error/20">
                                Risk Alert
                              </span>
                            )}
                            {logPatient?.readyForProgression && (
                              <span className="inline-flex items-center rounded-full bg-brand-successPale text-brand-successDeep text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 border border-brand-successDeep/10">
                                Ready
                              </span>
                            )}
                          </p>
                          <p className="text-brand-mute text-[10px] font-semibold">
                            Phase {log.phaseNumber} • Week {log.weekNumber}
                          </p>
                        </div>
                        <span className="text-[9px] text-brand-mute font-bold flex items-center gap-0.5">
                          <Clock size={10} />
                          {new Date(log.date).toLocaleDateString()}
                        </span>
                      </div>
                      
                      {log.exerciseLogs && log.exerciseLogs[0] && (
                        <div className="mt-1.5 p-2 bg-brand-surfaceSoft rounded-[16px] text-[10px] text-brand-charcoal border border-brand-hairlineSoft font-semibold">
                          Completed: {log.exerciseLogs[0].exerciseName} (Pain: {log.exerciseLogs[0].painScore}/10)
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
