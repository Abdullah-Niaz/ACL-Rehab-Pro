import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import { Activity, ShieldCheck, AlertCircle } from 'lucide-react';

export default function InviteAccept() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { loginWithSession } = useAuth();
  
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    api.get(`/invites/${token}`)
      .then(response => {
        setPatientData(response.data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.response?.data?.message || 'Invalid or expired invitation token');
        setLoading(false);
      });
  }, [token]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setSubmitting(true);
    try {
      const response = await api.post('/invites/accept', { token, password });
      setSuccess(true);
      
      // Auto login user
      setTimeout(() => {
        loginWithSession(response.data.token, response.data.user);
        navigate('/patient');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to activate account');
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-600 font-medium animate-pulse">Verifying invitation token...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center items-center gap-2 text-blue-600 font-bold text-3xl">
          <Activity size={32} />
          <span>ACL Rehab Pro</span>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
          Activate Your Account
        </h2>
        {patientData && (
          <p className="mt-2 text-center text-sm text-slate-600">
            Welcome, <span className="font-semibold text-blue-600">{patientData.name}</span>! Set your password to get started.
          </p>
        )}
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-slate-100 sm:rounded-2xl sm:px-10 border border-slate-100">
          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-xl mb-6 flex gap-3 items-start border border-red-100">
              <AlertCircle className="flex-shrink-0 mt-0.5" size={18} />
              <div className="text-sm font-medium">{error}</div>
            </div>
          )}

          {success && (
            <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl mb-6 flex gap-3 items-start border border-emerald-100">
              <ShieldCheck className="flex-shrink-0 mt-0.5 animate-bounce" size={18} />
              <div className="text-sm font-medium">Account activated successfully! Logging in...</div>
            </div>
          )}

          {patientData ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="label">Email Address</label>
                <input
                  type="email"
                  disabled
                  value={patientData.email}
                  className="input bg-slate-50 cursor-not-allowed text-slate-500 font-medium"
                />
              </div>

              <div>
                <label className="label">New Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={submitting || success}
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="label">Confirm New Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={submitting || success}
                  className="input"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitting || success}
                className="btn-primary w-full py-3 flex justify-center items-center font-semibold text-white shadow-md shadow-blue-200"
              >
                {submitting ? 'Activating...' : 'Activate Account'}
              </button>
            </form>
          ) : (
            <div className="text-center py-6">
              <p className="text-slate-600 mb-6 font-medium">Please request a new link from your physiotherapist.</p>
              <button
                onClick={() => navigate('/login')}
                className="btn-primary"
              >
                Return to Login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
