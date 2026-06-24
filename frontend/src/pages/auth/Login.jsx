import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Activity, ShieldAlert, ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Login() {
  const [email, setEmail] = useState('doctor@aclrehabpro.com');
  const [password, setPassword] = useState('Doctor123!');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const nav = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setErr('');
    setLoading(true);

    try {
      const user = await login(email, password);
      nav(user.role === 'doctor' ? '/doctor' : '/patient');
    } catch (error) {
      setErr(error.response?.data?.message || 'Invalid email or password');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-12 bg-white font-sans overflow-hidden">
      
      {/* Left panel: Dark Premium Clinical branding */}
      <div className="lg:col-span-5 bg-slate-950 text-white p-12 flex flex-col justify-between relative overflow-hidden select-none">
        {/* Ambient Radial Glow */}
        <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] rounded-full bg-blue-600/20 blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-600/10 blur-[100px] pointer-events-none"></div>

        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <Activity size={20} />
          </div>
          <span className="font-extrabold text-lg tracking-tight">ACL Rehab Pro</span>
        </div>

        <div className="space-y-6 my-auto relative z-10 py-20">
          <motion.span 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 px-3.5 py-1 text-xs font-bold text-blue-400"
          >
            <Sparkles size={12} />
            Version 2.0 Deployment
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-[1.1] text-slate-50"
          >
            Criterion-Based <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">
              ACL Rehabilitation
            </span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-slate-400 max-w-sm text-sm leading-relaxed"
          >
            A SaaS platform bridging the gap between orthopaedic surgeons, physiotherapists, and elite athletes returning to competitive sports.
          </motion.p>
        </div>

        <div className="text-slate-500 text-xs font-medium border-t border-slate-900 pt-6 relative z-10">
          © {new Date().getFullYear()} Sports Medicine Systems. Trusted by clinicians worldwide.
        </div>
      </div>

      {/* Right panel: Premium card login form */}
      <div className="lg:col-span-7 flex items-center justify-center p-6 bg-slate-50 md:p-12 relative">
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.25 }}
          className="bg-white p-8 md:p-10 rounded-2xl border border-slate-100 shadow-premium w-full max-w-md space-y-6"
        >
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Sign In</h2>
            <p className="text-slate-500 text-xs mt-1">Enter your clinical or patient credentials below.</p>
          </div>

          {err && (
            <motion.div 
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-100 text-xs font-semibold flex gap-2 items-start"
            >
              <ShieldAlert className="flex-shrink-0 mt-0.5" size={16} />
              <span>{err}</span>
            </motion.div>
          )}

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="label-premium">Email Address</label>
              <input 
                type="email"
                className="input-premium" 
                value={email} 
                onChange={e => setEmail(e.target.value)}
                placeholder="doctor@aclrehabpro.com"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="label-premium">Password</label>
              <input 
                type="password" 
                className="input-premium" 
                value={password} 
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={loading}
              />
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="btn-brand-primary w-full py-3 mt-2 flex justify-center items-center shadow-lg shadow-blue-100"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  Continue
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Accounts */}
          <div className="border-t border-slate-100 pt-6 space-y-3">
            <span className="text-[10px] font-extrabold tracking-widest text-slate-400 uppercase block text-center">
              Quick Sandbox Credentials
            </span>
            <div className="grid grid-cols-2 gap-3">
              <button 
                type="button" 
                className="btn-brand-secondary py-2 text-xs font-bold"
                onClick={() => { setEmail('doctor@aclrehabpro.com'); setPassword('Doctor123!'); }}
              >
                🏥 Doctor Account
              </button>
              <button 
                type="button" 
                className="btn-brand-secondary py-2 text-xs font-bold"
                onClick={() => { setEmail('patient@aclrehabpro.com'); setPassword('Patient123!'); }}
              >
                🏃 Patient Account
              </button>
            </div>
          </div>
        </motion.div>
      </div>

    </div>
  );
}
