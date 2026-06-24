import React, { useEffect, useState, useMemo } from 'react';
import Layout from '../../components/Layout';
import KpiCard from '../../components/KpiCard';
import api from '../../api/client';
import { quadSymmetry } from '../../utils/calculations';
import { TrendBar, TrendLine } from '../../components/Charts';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Download, BarChart3, TrendingUp, CheckSquare, Award } from 'lucide-react';

export default function DoctorAnalytics() {
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

  const analytics = useMemo(() => {
    const patients = data.patients || [];
    const logs = data.logs || [];

    // Calculate phase distributions
    const phasesCount = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 };
    patients.forEach(p => {
      if (p.currentPhase && phasesCount[p.currentPhase] !== undefined) {
        phasesCount[p.currentPhase]++;
      }
    });

    const phaseChartData = Object.entries(phasesCount).map(([phase, count]) => ({
      name: `Phase ${phase}`,
      Count: count
    }));

    // Calculate average RTS readiness score across the clinic (estimated by symmetry)
    const avgRts = Math.round(
      patients.reduce((acc, p) => {
        const sym = quadSymmetry(p.profile?.operatedQuadSize, p.profile?.healthyQuadSize);
        return acc + Math.min(95, Math.round(sym * 0.8));
      }, 0) / (patients.length || 1)
    );

    // Calculate monthly checkins/activity logging count
    const logActivity = {};
    logs.forEach(l => {
      const dateStr = new Date(l.date).toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
      logActivity[dateStr] = (logActivity[dateStr] || 0) + 1;
    });

    const logChartData = Object.entries(logActivity).map(([month, count]) => ({
      date: month,
      Checkins: count
    }));

    return {
      phaseChartData,
      logChartData,
      avgRts,
      totalPatients: patients.length,
      totalLogs: logs.length
    };
  }, [data]);

  // Generates and triggers browser file download of clinic CSV summary report
  const exportCSV = () => {
    const headers = ['Patient Name', 'Email', 'Sport', 'Graft Type', 'Graft Size', 'Flexion (deg)', 'Quad Symmetry (%)', 'Rehab Phase', 'Rehab Week'];
    const rows = data.patients.map(p => {
      const sym = quadSymmetry(p.profile?.operatedQuadSize, p.profile?.healthyQuadSize);
      return [
        `"${p.user?.name || ''}"`,
        `"${p.user?.email || ''}"`,
        `"${p.profile?.sport || ''}"`,
        `"${p.profile?.graftType || ''}"`,
        `"${p.profile?.graftSize || ''}"`,
        p.profile?.currentFlexion || 0,
        sym,
        p.currentPhase || 1,
        p.currentWeek || 1
      ];
    });

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Clinic_ACL_Rehab_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <Layout role="doctor">
        <p className="animate-pulse">Loading clinical reports...</p>
      </Layout>
    );
  }

  return (
    <Layout role="doctor">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Clinic Reports & Analytics</h2>
          <p className="text-xs text-slate-500 mt-1">Aggregated statistics, rehabilitation compliance, and return-to-sport metrics.</p>
        </div>

        <button 
          onClick={exportCSV}
          className="btn-brand-primary flex items-center gap-2 py-3 px-5 text-white font-semibold shadow-md shadow-blue-100 self-start"
        >
          <Download size={18} />
          Export Patient CSV
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard 
          title="Total Log Entries" 
          value={analytics.totalLogs} 
          sub="All historical sessions" 
          icon={CheckSquare}
        />
        <KpiCard 
          title="Estimated RTS Score" 
          value={`${analytics.avgRts}%`} 
          sub="Clinic wide average" 
          trendValue="Target 90%+"
          trendDirection="up"
          icon={Award}
        />
        <KpiCard 
          title="Patient Capacity" 
          value={analytics.totalPatients} 
          sub="Current active profiles" 
          icon={TrendingUp}
        />
        <KpiCard 
          title="Rehab Coverage" 
          value="100%" 
          sub="Patients on active plans" 
          icon={BarChart3}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        
        {/* Phase Distribution Chart */}
        <div className="card-premium">
          <h3 className="font-bold text-slate-800 text-base mb-4">Patient Distribution by Rehab Phase</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.phaseChartData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid stroke="#f8fafc" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" style={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} tickLine={false} axisLine={false} />
                <YAxis style={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: 'transparent' }} />
                <Bar dataKey="Count" fill="#2563EB" radius={[6, 6, 0, 0]} maxBarSize={45} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Clinical logs/checkin volume over time */}
        <div className="card-premium">
          <h3 className="font-bold text-slate-800 text-base mb-4">Log Submission Frequency by Month</h3>
          {analytics.logChartData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-slate-400 font-medium">
              No historical entries submitted yet.
            </div>
          ) : (
            <TrendLine data={analytics.logChartData} keyName="Checkins" label="Logs Submitted" strokeColor="#10B981" />
          )}
        </div>

      </div>
    </Layout>
  );
}
