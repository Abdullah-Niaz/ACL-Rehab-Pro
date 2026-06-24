import React, { useState } from 'react';
import Layout from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';
import { Save, User, Shield, Bell, CheckCircle } from 'lucide-react';

export default function DoctorSettings() {
  const { user } = useAuth();
  
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    clinicName: 'Elite Sports Physiotherapy Center',
    symmetryThreshold: '75',
    emailAlerts: true
  });

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess('');

    // Simulate saving settings
    setTimeout(() => {
      setSaving(false);
      setSuccess('Settings updated successfully!');
    }, 800);
  };

  return (
    <Layout role="doctor">
      <div className="mb-6">
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Workspace Settings</h2>
        <p className="text-xs text-slate-500 mt-1">Configure profile details, clinic parameters, and notification alerts.</p>
      </div>

      <div className="max-w-3xl space-y-6">
        {success && (
          <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl border border-emerald-100 text-sm font-semibold flex items-center gap-2">
            <CheckCircle size={16} />
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Doctor Profile */}
          <div className="card-premium">
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider mb-4 border-b pb-2 flex items-center gap-2">
              <User size={16} className="text-blue-600" />
              Clinician Details
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="label-premium">Full Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="input-premium"
                  required
                />
              </div>

              <div>
                <label className="label-premium">Email Address</label>
                <input
                  type="email"
                  value={form.email}
                  disabled
                  className="input-premium bg-slate-50 text-slate-400 cursor-not-allowed"
                />
              </div>

              <div className="md:col-span-2">
                <label className="label-premium">Clinic Name / Center</label>
                <input
                  type="text"
                  value={form.clinicName}
                  onChange={(e) => setForm({ ...form, clinicName: e.target.value })}
                  className="input-premium"
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 2: Clinical Thresholds */}
          <div className="card-premium">
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider mb-4 border-b pb-2 flex items-center gap-2">
              <Shield size={16} className="text-blue-600" />
              Clinical Benchmarks
            </h3>
            <div className="space-y-4">
              <div>
                <label className="label-premium">High Risk Symmetry Threshold (%)</label>
                <input
                  type="number"
                  min="50"
                  max="95"
                  value={form.symmetryThreshold}
                  onChange={(e) => setForm({ ...form, symmetryThreshold: e.target.value })}
                  className="input-premium max-w-xs"
                  required
                />
                <p className="text-xs text-slate-500 mt-1.5">
                  Patients with a calculated quad symmetry percentage below this threshold will automatically trigger a red "High Risk" alert on your dashboard.
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Notification Toggles */}
          <div className="card-premium">
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider mb-4 border-b pb-2 flex items-center gap-2">
              <Bell size={16} className="text-blue-600" />
              Notifications
            </h3>
            <div className="flex items-center justify-between py-2">
              <div>
                <span className="font-bold text-slate-800 text-sm block">Email Log Alerts</span>
                <span className="text-xs text-slate-500 block">Receive instant emails when a patient reports flexion complications.</span>
              </div>
              <input
                type="checkbox"
                checked={form.emailAlerts}
                onChange={(e) => setForm({ ...form, emailAlerts: e.target.checked })}
                className="w-5 h-5 accent-blue-600"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="btn-brand-primary w-full py-3.5 flex justify-center items-center shadow-lg shadow-blue-100"
          >
            {saving ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <Save size={18} />
                Save Settings
              </>
            )}
          </button>
        </form>
      </div>
    </Layout>
  );
}
