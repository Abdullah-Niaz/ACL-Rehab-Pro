import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../api/client';
import { ChevronLeft, Save, UserPlus, Info } from 'lucide-react';

export default function PatientForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [form, setForm] = useState({
    name: '',
    email: '',
    age: '',
    gender: 'Male',
    sport: '',
    surgeryDate: '',
    graftType: '',
    graftSize: '',
    tunnelPlacement: '',
    complications: '',
    debridementDate: '',
    suturesRemovalDate: '',
    currentFlexion: 0,
    healthyFlexion: 150,
    operatedQuad: '',
    healthyQuad: '',
    notes: '',
    currentPhase: 1,
    currentWeek: 1
  });

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (isEdit) {
      api.get(`/doctor/patients/${id}`)
        .then(response => {
          const p = response.data;
          setForm({
            name: p.userId?.name || '',
            email: p.userId?.email || '',
            age: p.age || '',
            gender: p.gender || 'Male',
            sport: p.sport || '',
            surgeryDate: p.surgeryDate ? p.surgeryDate.split('T')[0] : '',
            graftType: p.graftType || '',
            graftSize: p.graftSize || '',
            tunnelPlacement: p.tunnelPlacement || '',
            complications: p.complications || '',
            debridementDate: p.debridementDate ? p.debridementDate.split('T')[0] : '',
            suturesRemovalDate: p.suturesRemovalDate ? p.suturesRemovalDate.split('T')[0] : '',
            currentFlexion: p.currentFlexion || 0,
            healthyFlexion: p.healthyFlexion || 150,
            operatedQuad: p.operatedQuad || '',
            healthyQuad: p.healthyQuad || '',
            notes: p.notes || '',
            currentPhase: p.currentPhase || 1,
            currentWeek: p.currentWeek || 1
          });
          setLoading(false);
        })
        .catch(err => {
          setError('Failed to fetch patient data.');
          setLoading(false);
        });
    }
  }, [id, isEdit]);

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
    setSuccessMsg('');
    setSaving(true);

    try {
      if (isEdit) {
        await api.put(`/doctor/patients/${id}`, form);
        setSuccessMsg('Patient profile updated successfully!');
        setTimeout(() => navigate(`/doctor/patients/${id}`), 1000);
      } else {
        await api.post('/doctor/patients', form);
        setSuccessMsg(`Patient created successfully! Invitation email logged/sent.`);
        setTimeout(() => navigate('/doctor/patients'), 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error processing request');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout role="doctor">
        <p className="animate-pulse">Loading patient form...</p>
      </Layout>
    );
  }

  return (
    <Layout role="doctor">
      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-1 text-slate-600 hover:text-slate-900 transition font-medium"
        >
          <ChevronLeft size={18} />
          Back
        </button>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          {isEdit ? 'Edit Patient Profile' : 'Add New Patient'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl space-y-6">
        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-100 text-sm font-medium">
            {error}
          </div>
        )}
        
        {successMsg && (
          <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl border border-emerald-100 text-sm font-medium">
            {successMsg}
          </div>
        )}

        {/* Section 1: Personal Details */}
        <div className="card-premium">
          <h3 className="font-bold text-base border-b pb-2 mb-4 text-slate-800">1. Account & Personal Details</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="label-premium">Full Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="input-premium"
                required
                placeholder="e.g. John Doe"
              />
            </div>
            
            <div>
              <label className="label-premium">Email Address</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="input-premium"
                required
                disabled={isEdit}
                placeholder="patient@example.com"
              />
              {!isEdit && (
                <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1">
                  <Info size={12} />
                  An activation email will be sent to this address.
                </p>
              )}
            </div>

            <div>
              <label className="label-premium">Age</label>
              <input
                type="number"
                name="age"
                value={form.age}
                onChange={handleChange}
                className="input-premium"
                placeholder="e.g. 24"
              />
            </div>

            <div>
              <label className="label-premium">Gender</label>
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className="input-premium"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="label-premium">Sport Played</label>
              <input
                type="text"
                name="sport"
                value={form.sport}
                onChange={handleChange}
                className="input-premium"
                placeholder="e.g. Football, Basketball"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Surgical Parameters */}
        <div className="card-premium">
          <h3 className="font-bold text-base border-b pb-2 mb-4 text-slate-800">2. Surgical Metadata</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="label-premium">Surgery Date</label>
              <input
                type="date"
                name="surgeryDate"
                value={form.surgeryDate}
                onChange={handleChange}
                className="input-premium"
              />
            </div>

            <div>
              <label className="label-premium">Graft Type</label>
              <input
                type="text"
                name="graftType"
                value={form.graftType}
                onChange={handleChange}
                className="input-premium"
                placeholder="e.g. Peroneus Longus, Hamstring Autograft"
              />
            </div>

            <div>
              <label className="label-premium">Graft Size</label>
              <input
                type="text"
                name="graftSize"
                value={form.graftSize}
                onChange={handleChange}
                className="input-premium"
                placeholder="e.g. 9.5 mm"
              />
            </div>

            <div>
              <label className="label-premium">Tunnel Placement</label>
              <input
                type="text"
                name="tunnelPlacement"
                value={form.tunnelPlacement}
                onChange={handleChange}
                className="input-premium"
                placeholder="e.g. Anatomical ACL footprint"
              />
            </div>

            <div>
              <label className="label-premium">Sutures Removal Date</label>
              <input
                type="date"
                name="suturesRemovalDate"
                value={form.suturesRemovalDate}
                onChange={handleChange}
                className="input-premium"
              />
            </div>

            <div>
              <label className="label-premium">Debridement Date (if applicable)</label>
              <input
                type="date"
                name="debridementDate"
                value={form.debridementDate}
                onChange={handleChange}
                className="input-premium"
              />
            </div>

            <div className="md:col-span-2">
              <label className="label-premium">Complications / Secondary concerns</label>
              <textarea
                name="complications"
                value={form.complications}
                onChange={handleChange}
                className="input-premium h-20"
                placeholder="e.g. Cyclops lesion / scar tissue, wound complications"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Baseline Clinical Status */}
        <div className="card-premium">
          <h3 className="font-bold text-base border-b pb-2 mb-4 text-slate-800">3. Current Baseline Parameters</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="label-premium">Current Flexion (degrees)</label>
              <input
                type="number"
                name="currentFlexion"
                value={form.currentFlexion}
                onChange={handleChange}
                className="input-premium"
                placeholder="e.g. 110"
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
                placeholder="e.g. 150"
              />
            </div>

            <div>
              <label className="label-premium">Operated Quad Size (cm/inch)</label>
              <input
                type="number"
                step="0.1"
                name="operatedQuad"
                value={form.operatedQuad}
                onChange={handleChange}
                className="input-premium"
                placeholder="e.g. 20.2"
              />
            </div>

            <div>
              <label className="label-premium">Healthy Quad Size (cm/inch)</label>
              <input
                type="number"
                step="0.1"
                name="healthyQuad"
                value={form.healthyQuad}
                onChange={handleChange}
                className="input-premium"
                placeholder="e.g. 22.0"
              />
            </div>

            <div>
              <label className="label-premium">Rehab Phase Progression</label>
              <input
                type="number"
                name="currentPhase"
                value={form.currentPhase}
                onChange={handleChange}
                className="input-premium"
                placeholder="e.g. 3"
              />
            </div>

            <div>
              <label className="label-premium">Rehab Week Progression</label>
              <input
                type="number"
                name="currentWeek"
                value={form.currentWeek}
                onChange={handleChange}
                className="input-premium"
                placeholder="e.g. 18"
              />
            </div>

            <div className="md:col-span-2">
              <label className="label-premium">Surgeon Notes</label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                className="input-premium h-24"
                placeholder="Rehab goals, criteria targets..."
              />
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className="btn-brand-primary flex items-center gap-2 py-3 px-6 text-white font-semibold"
          >
            {saving ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : isEdit ? (
              <Save size={18} />
            ) : (
              <UserPlus size={18} />
            )}
            {saving ? 'Saving...' : isEdit ? 'Update Profile' : 'Create Patient Profile'}
          </button>
          
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn-brand-secondary px-6 font-semibold"
          >
            Cancel
          </button>
        </div>
      </form>
    </Layout>
  );
}
