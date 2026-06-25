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
        <h2 className="text-3xl font-extrabold text-brand-ink tracking-tighter">My Medical Profile</h2>
        <p className="text-xs text-brand-mute mt-1">Review your verified clinical metadata, surgery details, and recovery milestones.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 items-start select-none">
        
        {/* 1. Left column: Medical Summary Card */}
        <div className="space-y-6">
          <div className="card-premium">
            <h3 className="font-bold text-brand-ink text-sm uppercase tracking-wider mb-4 border-b border-brand-hairlineSoft pb-2 flex items-center gap-2">
              <User size={16} className="text-brand-primary" />
              Athlete Summary
            </h3>
            
            <div className="space-y-4 text-xs font-semibold text-brand-charcoal">
              <div>
                <span className="text-brand-mute block text-[10px] uppercase font-bold tracking-wider mb-0.5">Name</span>
                <span className="text-brand-ink text-sm font-bold">{patient.user?.name}</span>
              </div>
              
              <div>
                <span className="text-brand-mute block text-[10px] uppercase font-bold tracking-wider mb-0.5">Email</span>
                <span className="text-brand-ink text-sm font-bold">{patient.user?.email}</span>
              </div>

              <div>
                <span className="text-brand-mute block text-[10px] uppercase font-bold tracking-wider mb-0.5">Demographics</span>
                <span className="text-brand-ink text-sm font-bold">{p.age || 'N/A'} yrs / {p.gender || 'N/A'}</span>
              </div>

              <div>
                <span className="text-brand-mute block text-[10px] uppercase font-bold tracking-wider mb-0.5">Primary Sport</span>
                <span className="text-brand-ink text-sm font-bold">{p.sport || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Graft Information Card */}
          <div className="card-premium">
            <h3 className="font-bold text-brand-ink text-sm uppercase tracking-wider mb-4 border-b border-brand-hairlineSoft pb-2 flex items-center gap-2">
              <Heart size={16} className="text-brand-primary" />
              Graft Specifications
            </h3>
            
            <div className="space-y-4 text-xs font-semibold text-brand-charcoal">
              <div>
                <span className="text-brand-mute block text-[10px] uppercase font-bold tracking-wider mb-0.5">Graft Autograft / Type</span>
                <span className="text-brand-ink text-sm font-bold">{p.graftType || 'Not specified'}</span>
              </div>

              <div>
                <span className="text-brand-mute block text-[10px] uppercase font-bold tracking-wider mb-0.5">Graft Size (Diameter)</span>
                <span className="text-brand-ink text-sm font-bold">{p.graftSize || 'Not specified'}</span>
              </div>

              <div>
                <span className="text-brand-mute block text-[10px] uppercase font-bold tracking-wider mb-0.5">Tunnel Placement</span>
                <span className="text-brand-ink text-sm font-bold">{p.tunnelPlacement || 'Not specified'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Middle column: Surgery details & complications */}
        <div className="space-y-6">
          <div className="card-premium">
            <h3 className="font-bold text-brand-ink text-sm uppercase tracking-wider mb-4 border-b border-brand-hairlineSoft pb-2 flex items-center gap-2">
              <Calendar size={16} className="text-brand-primary" />
              Surgical Data
            </h3>
            
            <div className="space-y-4 text-xs font-semibold text-brand-charcoal">
              <div>
                <span className="text-brand-mute block text-[10px] uppercase font-bold tracking-wider mb-0.5">Date of Surgery</span>
                <span className="text-brand-ink text-sm font-bold">
                  {p.surgeryDate ? new Date(p.surgeryDate).toLocaleDateString(undefined, { dateStyle: 'long' }) : 'N/A'}
                </span>
              </div>

              <div>
                <span className="text-brand-mute block text-[10px] uppercase font-bold tracking-wider mb-0.5">Meniscus Concomitant Injury</span>
                <span className="text-brand-ink text-sm font-bold">{p.meniscusInjury || 'None reported'}</span>
              </div>

              <div>
                <span className="text-brand-mute block text-[10px] uppercase font-bold tracking-wider mb-0.5">Primary Debridement Date</span>
                <span className="text-brand-ink text-sm font-bold">
                  {p.debridementDate ? new Date(p.debridementDate).toLocaleDateString() : 'None'}
                </span>
              </div>

              <div>
                <span className="text-brand-mute block text-[10px] uppercase font-bold tracking-wider mb-0.5">Secondary Debridement Date</span>
                <span className="text-brand-ink text-sm font-bold">
                  {p.debridementDate2 ? new Date(p.debridementDate2).toLocaleDateString() : 'None'}
                </span>
              </div>

              <div>
                <span className="text-brand-mute block text-[10px] uppercase font-bold tracking-wider mb-0.5">Complications reported</span>
                <span className="text-brand-charcoal text-sm block bg-brand-surfaceSoft p-2.5 rounded-[16px] border border-brand-hairlineSoft mt-1 font-bold">
                  {p.complications || 'No complications.'}
                </span>
              </div>
            </div>
          </div>

          {/* Progress metrics card */}
          <div className="card-premium">
            <h3 className="font-bold text-brand-ink text-sm uppercase tracking-wider mb-4 border-b border-brand-hairlineSoft pb-2 flex items-center gap-2">
              <Award size={16} className="text-brand-primary" />
              Rehab Baselines
            </h3>
            
            <div className="space-y-4 text-xs font-semibold text-brand-charcoal">
              <div className="flex justify-between items-center">
                <span className="text-brand-mute">Flexion angle:</span>
                <span className="font-extrabold text-brand-ink">{p.currentFlexion}° / {p.healthyFlexion}° target</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-brand-mute">Operated Quad Size:</span>
                <span className="font-extrabold text-brand-ink">{p.operatedQuadSize} cm</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-brand-mute">Healthy Quad Size:</span>
                <span className="font-extrabold text-brand-ink">{p.healthyQuadSize} cm</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-brand-mute">Quad Symmetry:</span>
                <span className="inline-block rounded-full px-2.5 py-0.5 text-brand-successDeep bg-brand-successPale border border-brand-successDeep/10 font-bold">{sym}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Right column: Recovery timeline checklist */}
        <div className="card-premium">
          <h3 className="font-bold text-brand-ink text-sm uppercase tracking-wider mb-4 border-b border-brand-hairlineSoft pb-2 flex items-center gap-2">
            <Clock size={16} className="text-brand-primary" />
            Milestone Checklist
          </h3>
          
          <div className="relative pl-4 border-l border-brand-hairlineSoft space-y-5 text-xs">
            <div className="relative">
              <span className="absolute -left-[21px] top-0.5 h-2.5 w-2.5 rounded-full bg-brand-successDeep ring-4 ring-brand-canvas"></span>
              <p className="font-bold text-brand-charcoal">ACL Reconstruction Surgery Completed</p>
              <p className="text-brand-mute text-[10px]">
                {p.surgeryDate ? new Date(p.surgeryDate).toLocaleDateString() : 'N/A'}
              </p>
            </div>

            <div className="relative">
              <span className="absolute -left-[21px] top-0.5 h-2.5 w-2.5 rounded-full bg-brand-successDeep ring-4 ring-brand-canvas"></span>
              <p className="font-bold text-brand-charcoal">Sutures / Wound Healing</p>
              <p className="text-brand-mute text-[10px]">Clinically cleared by surgeon</p>
            </div>

            <div className="relative">
              <span className={`absolute -left-[21px] top-0.5 h-2.5 w-2.5 rounded-full ring-4 ring-brand-canvas ${
                patient.currentPhase >= 3 ? 'bg-brand-successDeep' : 'bg-brand-primary'
              }`}></span>
              <p className="font-bold text-brand-charcoal">Flexion &gt; 120° ROM target</p>
              <p className="text-brand-mute text-[10px]">Status: {p.currentFlexion >= 120 ? 'Restored' : 'Progressing'}</p>
            </div>

            <div className="relative">
              <span className={`absolute -left-[21px] top-0.5 h-2.5 w-2.5 rounded-full ring-4 ring-brand-canvas ${
                sym >= 90 ? 'bg-brand-successDeep' : 'bg-brand-stone'
              }`}></span>
              <p className="font-bold text-brand-charcoal">90%+ Quad Size index symmetry</p>
              <p className="text-brand-mute text-[10px]">Status: {sym >= 90 ? 'Achieved' : 'Active building'}</p>
            </div>

            <div className="relative">
              <span className={`absolute -left-[21px] top-0.5 h-2.5 w-2.5 rounded-full ring-4 ring-brand-canvas ${
                patient.currentPhase === 7 ? 'bg-brand-successDeep' : 'bg-brand-stone'
              }`}></span>
              <p className="font-bold text-brand-charcoal">Return-to-Football non contact training</p>
              <p className="text-brand-mute text-[10px]">Requires surgeon clearance</p>
            </div>
          </div>
        </div>

      </div>
    </Layout>
  );
}
