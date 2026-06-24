import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import api from '../../api/client';
import { quadSymmetry } from '../../utils/calculations';
import { User, Calendar, ShieldCheck, Heart, Clock, Award } from 'lucide-react';

export default function PatientProfileView() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/progress/me')
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error loading patient profile", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <Layout role="patient">
        <p className="animate-pulse">Loading personal medical profile...</p>
      </Layout>
    );
  }

  const p = data.patient.profile;
  const patient = data.patient;
  const sym = quadSymmetry(p.operatedQuadSize, p.healthyQuadSize);

  return (
    <Layout role="patient">
      <div className="mb-6">
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">My Medical Profile</h2>
        <p className="text-xs text-slate-500 mt-1">Review your verified clinical metadata, surgery details, and recovery milestones.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 items-start select-none">
        
        {/* 1. Left column: Medical Summary Card */}
        <div className="space-y-6">
          <div className="card-premium">
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider mb-4 border-b pb-2 flex items-center gap-2">
              <User size={16} className="text-blue-600" />
              Athlete Summary
            </h3>
            
            <div className="space-y-4 text-xs font-semibold text-slate-700">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-0.5">Name</span>
                <span className="text-slate-950 text-sm">{patient.user?.name}</span>
              </div>
              
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-0.5">Email</span>
                <span className="text-slate-950 text-sm">{patient.user?.email}</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-0.5">Demographics</span>
                <span className="text-slate-950 text-sm">{p.age || 'N/A'} yrs / {p.gender || 'N/A'}</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-0.5">Primary Sport</span>
                <span className="text-slate-950 text-sm">{p.sport || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Graft Information Card */}
          <div className="card-premium">
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider mb-4 border-b pb-2 flex items-center gap-2">
              <Heart size={16} className="text-blue-600" />
              Graft Specifications
            </h3>
            
            <div className="space-y-4 text-xs font-semibold text-slate-700">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-0.5">Graft Autograft / Type</span>
                <span className="text-slate-950 text-sm">{p.graftType || 'Not specified'}</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-0.5">Graft Size (Diameter)</span>
                <span className="text-slate-950 text-sm">{p.graftSize || 'Not specified'}</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-0.5">Tunnel Placement</span>
                <span className="text-slate-950 text-sm">{p.tunnelPlacement || 'Not specified'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Middle column: Surgery details & complications */}
        <div className="space-y-6">
          <div className="card-premium">
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider mb-4 border-b pb-2 flex items-center gap-2">
              <Calendar size={16} className="text-blue-600" />
              Surgical Data
            </h3>
            
            <div className="space-y-4 text-xs font-semibold text-slate-700">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-0.5">Date of Surgery</span>
                <span className="text-slate-950 text-sm">
                  {p.surgeryDate ? new Date(p.surgeryDate).toLocaleDateString(undefined, { dateStyle: 'long' }) : 'N/A'}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-0.5">Meniscus Concomitant Injury</span>
                <span className="text-slate-950 text-sm">{p.meniscusInjury || 'None reported'}</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-0.5">Secondary Debridement Date</span>
                <span className="text-slate-950 text-sm">
                  {p.debridementDate ? new Date(p.debridementDate).toLocaleDateString() : 'None'}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-0.5">Complications reported</span>
                <span className="text-slate-950 text-sm block bg-slate-50 p-2.5 rounded-lg border border-slate-100 mt-1">
                  {p.complications || 'No complications.'}
                </span>
              </div>
            </div>
          </div>

          {/* Progress metrics card */}
          <div className="card-premium">
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider mb-4 border-b pb-2 flex items-center gap-2">
              <Award size={16} className="text-blue-600" />
              Rehab Baselines
            </h3>
            
            <div className="space-y-4 text-xs font-semibold text-slate-700">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Flexion angle:</span>
                <span className="font-extrabold text-slate-900">{p.currentFlexion}° / {p.healthyFlexion}° target</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-500">Operated Quad Size:</span>
                <span className="font-extrabold text-slate-900">{p.operatedQuadSize} cm</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-500">Healthy Quad Size:</span>
                <span className="font-extrabold text-slate-900">{p.healthyQuadSize} cm</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-500">Quad Symmetry:</span>
                <span className="inline-block rounded px-2 py-0.5 text-emerald-700 bg-emerald-50 font-bold">{sym}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Right column: Recovery timeline checklist */}
        <div className="card-premium">
          <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider mb-4 border-b pb-2 flex items-center gap-2">
            <Clock size={16} className="text-blue-600" />
            Milestone Checklist
          </h3>
          
          <div className="relative pl-4 border-l border-slate-100 space-y-5 text-xs">
            <div className="relative">
              <span className="absolute -left-[21px] top-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-4 ring-white"></span>
              <p className="font-bold text-slate-800">ACL Reconstruction Surgery Completed</p>
              <p className="text-slate-500 text-[10px]">
                {p.surgeryDate ? new Date(p.surgeryDate).toLocaleDateString() : 'N/A'}
              </p>
            </div>

            <div className="relative">
              <span className="absolute -left-[21px] top-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-4 ring-white"></span>
              <p className="font-bold text-slate-800">Sutures / Wound Healing</p>
              <p className="text-slate-500 text-[10px]">Clinically cleared by surgeon</p>
            </div>

            <div className="relative">
              <span className={`absolute -left-[21px] top-0.5 h-2.5 w-2.5 rounded-full ring-4 ring-white ${
                patient.currentPhase >= 3 ? 'bg-emerald-500' : 'bg-blue-600 animate-pulse'
              }`}></span>
              <p className="font-bold text-slate-800">Flexion &gt; 120° ROM target</p>
              <p className="text-slate-500 text-[10px]">Status: {p.currentFlexion >= 120 ? 'Restored' : 'Progressing'}</p>
            </div>

            <div className="relative">
              <span className={`absolute -left-[21px] top-0.5 h-2.5 w-2.5 rounded-full ring-4 ring-white ${
                sym >= 90 ? 'bg-emerald-500' : 'bg-slate-300'
              }`}></span>
              <p className="font-bold text-slate-800">90%+ Quad Size index symmetry</p>
              <p className="text-slate-500 text-[10px]">Status: {sym >= 90 ? 'Achieved' : 'Active building'}</p>
            </div>

            <div className="relative">
              <span className={`absolute -left-[21px] top-0.5 h-2.5 w-2.5 rounded-full ring-4 ring-white ${
                patient.currentPhase === 7 ? 'bg-emerald-500' : 'bg-slate-300'
              }`}></span>
              <p className="font-bold text-slate-800">Return-to-Football non contact training</p>
              <p className="text-slate-500 text-[10px]">Requires surgeon clearance</p>
            </div>
          </div>
        </div>

      </div>
    </Layout>
  );
}
