import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import api from '../../api/client';
import { Save, Ruler, CheckCircle } from 'lucide-react';

export default function PatientMeasurements() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    currentFlexion: '',
    healthyFlexion: '',
    operatedQuad: '',
    healthyQuad: ''
  });

  const fetchProfile = () => {
    api.get('/progress/me')
      .then(res => {
        const p = res.data.patient.profile;
        setProfile(p);
        setForm({
          currentFlexion: p.currentFlexion || '',
          healthyFlexion: p.healthyFlexion || '',
          operatedQuad: p.operatedQuadSize || '',
          healthyQuad: p.healthyQuadSize || ''
        });
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to load clinical profile.');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      // Submitting measurements to progress endpoint logs the values in history and updates baseline
      await api.post('/progress', {
        flexion: +form.currentFlexion,
        operatedQuad: +form.operatedQuad,
        healthyQuad: +form.healthyQuad,
        exerciseLogs: [
          {
            exerciseName: 'Measurements Update',
            completed: true,
            painScore: 0,
            swellingScore: 0,
            difficultyScore: 0,
            notes: 'Patient submitted measurements update'
          }
        ]
      });

      setSuccess('Measurements updated successfully!');
      setSaving(false);
      fetchProfile(); // reload profile to see changes
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating measurements');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout role="patient">
        <p className="animate-pulse">Loading measurements...</p>
      </Layout>
    );
  }

  return (
    <Layout role="patient">
      <h2 className="text-2xl font-bold mb-5 flex items-center gap-2">
        <Ruler className="text-blue-600" />
        Log My Measurements
      </h2>

      <div className="max-w-2xl space-y-6">
        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-100 text-sm font-medium">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl border border-emerald-100 text-sm font-medium flex gap-2 items-center">
            <CheckCircle size={16} />
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="card-premium space-y-5">
          <p className="text-slate-600 text-sm">
            Keep track of your knee flexion degrees and bilateral quad circumference. These metrics help compute your symmetry percentages.
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="label-premium">Current Flexion Range (degrees)</label>
              <input
                type="number"
                name="currentFlexion"
                value={form.currentFlexion}
                onChange={handleChange}
                className="input-premium"
                required
                placeholder="e.g. 135"
              />
            </div>

            <div>
              <label className="label-premium">Target Healthy Flexion (degrees)</label>
              <input
                type="number"
                name="healthyFlexion"
                value={form.healthyFlexion}
                onChange={handleChange}
                className="input-premium"
                required
                placeholder="e.g. 150"
              />
            </div>

            <div>
              <label className="label-premium">Operated Quad Circumference (cm or inches)</label>
              <input
                type="number"
                step="0.1"
                name="operatedQuad"
                value={form.operatedQuad}
                onChange={handleChange}
                className="input-premium"
                required
                placeholder="e.g. 20.2"
              />
            </div>

            <div>
              <label className="label-premium">Healthy Quad Circumference (cm or inches)</label>
              <input
                type="number"
                step="0.1"
                name="healthyQuad"
                value={form.healthyQuad}
                onChange={handleChange}
                className="input-premium"
                required
                placeholder="e.g. 22.0"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="btn-brand-primary w-full py-3 flex items-center justify-center gap-2 font-semibold text-white mt-4"
          >
            {saving ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <Save size={18} />
            )}
            {saving ? 'Saving...' : 'Update Measurements'}
          </button>
        </form>
      </div>
    </Layout>
  );
}
