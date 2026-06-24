import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Layout from "../../components/Layout";
import KpiCard from "../../components/KpiCard";
import { TrendLine } from "../../components/Charts";
import api from "../../api/client";
import { quadSymmetry } from "../../utils/calculations";
import { Edit, FileText, MessageSquare, LineChart, Plus, Calendar } from "lucide-react";

export default function PatientDetail() {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [logs, setLogs] = useState([]);
  const [notesList, setNotesList] = useState([]);
  const [note, setNote] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  const fetchNotes = () => {
    api.get(`/notes/${id}`).then((r) => setNotesList(r.data));
  };

  useEffect(() => {
    api.get(`/doctor/patients/${id}`)
      .then((r) => {
        setPatient(r.data);
        fetchNotes();
        return api.get(`/progress/patient/${r.data.userId?._id}`);
      })
      .then((r) => setLogs(r.data))
      .catch((err) => console.error("Error loading patient details", err));
  }, [id]);

  const chart = useMemo(
    () =>
      logs.map((l) => ({
        date: new Date(l.date).toLocaleDateString(),
        quad: l.measurements?.operatedQuadSize,
        flexion: l.measurements?.flexion,
        pain: Math.max(
          ...(l.exerciseLogs || []).map((e) => e.painScore || 0),
          0,
        ),
      })),
    [logs],
  );

  if (!patient)
    return (
      <Layout role="doctor">
        <p className="animate-pulse">Loading patient details...</p>
      </Layout>
    );

  const p = patient;
  const sym = quadSymmetry(p.operatedQuad, p.healthyQuad);

  async function saveNote() {
    if (!note.trim()) return;
    setSavingNote(true);
    await api.post("/notes", { patient: id, note, tags: ["review"] });
    setNote("");
    setSavingNote(false);
    fetchNotes(); // reload notes
  }

  return (
    <Layout role="doctor">
      {/* Header and Quick Action bar */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <div>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block">Patient Profile</span>
          <h2 className="text-3xl font-extrabold text-slate-900">{patient.userId?.name}</h2>
          <span className="text-sm text-slate-500">{patient.userId?.email}</span>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Link
            className="btn-primary flex items-center gap-1.5 px-4 py-2 text-sm text-white font-semibold"
            to={`/doctor/patients/${patient.userId?._id}/plan`}
          >
            <FileText size={16} />
            Edit Rehab Plan
          </Link>
          
          <Link
            className="border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm px-4 py-2 rounded-xl flex items-center gap-1.5 transition"
            to={`/doctor/messages/${patient.userId?._id}`}
          >
            <MessageSquare size={16} />
            Send Message
          </Link>
          
          <Link
            className="border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm px-4 py-2 rounded-xl flex items-center gap-1.5 transition"
            to={`/doctor/patients/${id}/progress`}
          >
            <LineChart size={16} />
            Daily Logs
          </Link>
          
          <Link
            className="border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm px-4 py-2 rounded-xl flex items-center gap-1.5 transition"
            to={`/doctor/patients/${id}/edit`}
          >
            <Edit size={16} />
            Edit Profile
          </Link>
        </div>
      </div>

      {/* KPI stats metrics summary */}
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <KpiCard
          title="Quad Symmetry"
          value={`${sym}%`}
          sub={`${p.operatedQuad || 0} / ${p.healthyQuad || 0} cm`}
        />
        <KpiCard title="Flexion" value={`${p.currentFlexion || 0}°+`} sub={`Goal ${p.healthyFlexion || 150}°+`} />
        <KpiCard title="Graft Details" value={p.graftSize || 'N/A'} sub={p.graftType || 'N/A'} />
        <KpiCard title="Current Phase" value={`Phase ${p.currentPhase}`} sub={`Week ${p.currentWeek}`} />
      </div>

      {/* Profile details and Clinical notes */}
      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Medical details list */}
        <div className="card lg:col-span-2 space-y-4">
          <h3 className="font-bold text-lg text-slate-800 border-b pb-2 mb-3">Clinical Metadata</h3>
          
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <p><span className="text-slate-500 font-medium">Age / Gender:</span> <b className="text-slate-800">{p.age || 'N/A'} yrs / {p.gender}</b></p>
            <p><span className="text-slate-500 font-medium">Sport/Activity:</span> <b className="text-slate-800">{p.sport || 'N/A'}</b></p>
            <p>
              <span className="text-slate-500 font-medium">Surgery Date:</span>{' '}
              <b className="text-slate-800">{p.surgeryDate ? new Date(p.surgeryDate).toLocaleDateString() : 'N/A'}</b>
            </p>
            <p><span className="text-slate-500 font-medium">Tunnel Placement:</span> <b className="text-slate-800">{p.tunnelPlacement || 'N/A'}</b></p>
            <p>
              <span className="text-slate-500 font-medium">Sutures Removed:</span>{' '}
              <b className="text-slate-800">{p.suturesRemovalDate ? new Date(p.suturesRemovalDate).toLocaleDateString() : 'N/A'}</b>
            </p>
            <p>
              <span className="text-slate-500 font-medium">Debridement Date:</span>{' '}
              <b className="text-slate-800">{p.debridementDate ? new Date(p.debridementDate).toLocaleDateString() : 'N/A'}</b>
            </p>
            <div className="md:col-span-2">
              <span className="text-slate-500 font-medium">Complications / Secondary Issues:</span>
              <p className="bg-slate-50 p-3 rounded-xl border border-slate-100 mt-1 text-slate-700 font-medium">
                {p.complications || 'None reported.'}
              </p>
            </div>
            <div className="md:col-span-2">
              <span className="text-slate-500 font-medium">Surgeon Profile Notes:</span>
              <p className="bg-slate-50 p-3 rounded-xl border border-slate-100 mt-1 text-slate-700 italic">
                "{p.notes || 'No general notes recorded.'}"
              </p>
            </div>
          </div>
        </div>

        {/* Notes writing module and historic logs */}
        <div className="flex flex-col gap-6">
          <div className="card">
            <h3 className="font-bold text-slate-800 mb-3">Add Clinical Note</h3>
            <textarea
              className="input h-24 mb-3"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Record a clinical observation, ROM changes, plan adjustments..."
            />
            <button 
              onClick={saveNote} 
              disabled={savingNote || !note.trim()} 
              className="btn-primary w-full py-2.5 flex items-center justify-center gap-1.5 text-white font-semibold"
            >
              <Plus size={16} />
              Save Note
            </button>
          </div>

          {/* Clinical note history feed */}
          <div className="card max-h-[300px] overflow-y-auto">
            <h3 className="font-bold text-slate-800 mb-3 border-b pb-1">Notes History ({notesList.length})</h3>
            <div className="space-y-3">
              {notesList.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No notes recorded yet.</p>
              ) : (
                notesList.map((n) => (
                  <div key={n._id} className="bg-slate-50/70 p-3 rounded-xl border border-slate-100 text-xs">
                    <p className="text-slate-700 font-medium mb-1.5">{n.note}</p>
                    <div className="flex justify-between items-center text-[10px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar size={10} />
                        {new Date(n.createdAt).toLocaleDateString()}
                      </span>
                      {n.tags && n.tags[0] && (
                        <span className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">
                          {n.tags[0]}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Trend Graphs */}
      {logs.length > 0 && (
        <div className="grid lg:grid-cols-2 gap-6 mt-6">
          <div className="card">
            <h3 className="font-bold mb-4 text-slate-800">Quad Circumference Trend</h3>
            <TrendLine data={chart} keyName="quad" label="Operated Quad size" />
          </div>
          
          <div className="card">
            <h3 className="font-bold mb-4 text-slate-800">Joint Flexion Range Trend</h3>
            <TrendLine data={chart} keyName="flexion" label="Flexion angle" />
          </div>
        </div>
      )}
    </Layout>
  );
}
