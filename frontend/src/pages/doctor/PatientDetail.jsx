import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import KpiCard from "../../components/KpiCard";
import { TrendLine } from "../../components/Charts";
import api from "../../api/client";
import { quadSymmetry } from "../../utils/calculations";
import { Edit, FileText, MessageSquare, LineChart, Plus, Calendar, Trash2 } from "lucide-react";

export default function PatientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [logs, setLogs] = useState([]);
  const [notesList, setNotesList] = useState([]);
  const [note, setNote] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [deleting, setDeleting] = useState(false);

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

  const weeksPostOp = useMemo(() => {
    if (!patient?.surgeryDate) return null;
    const diffTime = Math.abs(new Date() - new Date(patient.surgeryDate));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.floor(diffDays / 7);
  }, [patient?.surgeryDate]);

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

  async function handleDelete() {
    if (!window.confirm("Are you sure you want to delete this patient profile? This action is permanent and deletes all associated rehab plans, logs, and messages.")) {
      return;
    }
    setDeleting(true);
    try {
      await api.delete(`/doctor/patients/${id}`);
      navigate("/doctor/dashboard");
    } catch (err) {
      console.error("Error deleting patient", err);
      alert(err.response?.data?.message || "Failed to delete patient profile");
      setDeleting(false);
    }
  }

  return (
    <Layout role="doctor">
      {/* Header and Quick Action bar */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <div>
          <span className="text-xs font-bold text-brand-mute uppercase tracking-widest block">Patient Profile</span>
          <h2 className="text-3xl font-extrabold text-brand-ink tracking-tighter">{patient.userId?.name}</h2>
          <span className="text-sm text-brand-mute font-semibold">{patient.userId?.email}</span>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Link
            className="btn-brand-primary flex items-center gap-1.5 px-4 py-2 text-sm text-white font-bold shadow-none"
            to={`/doctor/patients/${patient.userId?._id}/plan`}
          >
            <FileText size={16} />
            Edit Rehab Plan
          </Link>
          
          <Link
            className="btn-brand-secondary flex items-center gap-1.5 text-sm shadow-none"
            to={`/doctor/messages/${patient.userId?._id}`}
          >
            <MessageSquare size={16} />
            Send Message
          </Link>
          
          <Link
            className="btn-brand-secondary flex items-center gap-1.5 text-sm shadow-none"
            to={`/doctor/patients/${id}/progress`}
          >
            <LineChart size={16} />
            Daily Logs
          </Link>
          
          <Link
            className="btn-brand-secondary flex items-center gap-1.5 text-sm shadow-none"
            to={`/doctor/patients/${id}/edit`}
          >
            <Edit size={16} />
            Edit Profile
          </Link>

          <button
            onClick={handleDelete}
            disabled={deleting}
            className="btn-brand-danger flex items-center gap-1.5 text-sm shadow-none"
          >
            <Trash2 size={16} />
            {deleting ? "Deleting..." : "Delete Patient"}
          </button>
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
        
        {/* Left Column: Clinical Metadata Widgets */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Row 1: Demographics & Surgical Summary Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            
            {/* Widget 1: General & Sport Profile */}
            <div className="card-premium flex flex-col justify-between">
              <div>
                <h3 className="font-extrabold text-xs text-brand-mute uppercase tracking-widest border-b border-brand-hairlineSoft pb-2 mb-4">
                  Patient Demographics
                </h3>
                <div className="space-y-3.5 text-xs">
                  <div className="flex justify-between items-center py-0.5 border-b border-brand-hairlineSoft/40">
                    <span className="text-brand-mute font-semibold">Age</span>
                    <span className="text-brand-ink font-bold">{p.age ? `${p.age} years` : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center py-0.5 border-b border-brand-hairlineSoft/40">
                    <span className="text-brand-mute font-semibold">Gender</span>
                    <span className="text-brand-ink font-bold capitalize">{p.gender || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center py-0.5 border-b border-brand-hairlineSoft/40">
                    <span className="text-brand-mute font-semibold">Sport / Activity</span>
                    <span className="text-brand-ink font-bold">{p.sport || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Widget 2: Surgical Info */}
            <div className="card-premium flex flex-col justify-between">
              <div>
                <h3 className="font-extrabold text-xs text-brand-mute uppercase tracking-widest border-b border-brand-hairlineSoft pb-2 mb-4">
                  Surgical Parameters
                </h3>
                <div className="space-y-3.5 text-xs">
                  <div className="flex justify-between items-start py-0.5 border-b border-brand-hairlineSoft/40">
                    <span className="text-brand-mute font-semibold">Surgery Date</span>
                    <div className="text-right">
                      <span className="text-brand-ink font-bold block">
                        {p.surgeryDate ? new Date(p.surgeryDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}
                      </span>
                      {weeksPostOp !== null && (
                        <span className="text-[9px] text-brand-primary font-extrabold uppercase tracking-wider block mt-0.5">
                          {weeksPostOp} Weeks Post-Op
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-0.5 border-b border-brand-hairlineSoft/40">
                    <span className="text-brand-mute font-semibold">Graft Type & Size</span>
                    <span className="text-brand-ink font-bold">
                      {p.graftType || 'N/A'} {p.graftSize ? `(${p.graftSize})` : ''}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-0.5 border-b border-brand-hairlineSoft/40">
                    <span className="text-brand-mute font-semibold">Tunnel Placement</span>
                    <span className="text-brand-ink font-bold">{p.tunnelPlacement || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Row 2: Recovery Milestones & Timeline */}
          <div className="card-premium">
            <h3 className="font-extrabold text-xs text-brand-mute uppercase tracking-widest border-b border-brand-hairlineSoft pb-2 mb-4">
              Recovery Milestones
            </h3>
            <div className="grid md:grid-cols-3 gap-4 text-xs">
              <div className="p-3.5 bg-brand-surfaceSoft rounded-md border border-brand-hairlineSoft">
                <span className="text-[10px] text-brand-mute uppercase tracking-widest font-extrabold block mb-1">Sutures Removal</span>
                <span className="text-brand-ink font-bold flex items-center gap-1.5">
                  <Calendar size={14} className="text-brand-mute" />
                  {p.suturesRemovalDate ? new Date(p.suturesRemovalDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'Pending / Not logged'}
                </span>
              </div>
              <div className="p-3.5 bg-brand-surfaceSoft rounded-md border border-brand-hairlineSoft">
                <span className="text-[10px] text-brand-mute uppercase tracking-widest font-extrabold block mb-1">Primary Debridement</span>
                <span className="text-brand-ink font-bold flex items-center gap-1.5">
                  <Calendar size={14} className="text-brand-mute" />
                  {p.debridementDate ? new Date(p.debridementDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'None scheduled'}
                </span>
              </div>
              <div className="p-3.5 bg-brand-surfaceSoft rounded-md border border-brand-hairlineSoft">
                <span className="text-[10px] text-brand-mute uppercase tracking-widest font-extrabold block mb-1">Secondary Debridement</span>
                <span className="text-brand-ink font-bold flex items-center gap-1.5">
                  <Calendar size={14} className="text-brand-mute" />
                  {p.debridementDate2 ? new Date(p.debridementDate2).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'None scheduled'}
                </span>
              </div>
            </div>
          </div>

          {/* Row 3: Complications & Warnings Panel */}
          <div className={`card-premium ${p.complications ? 'border-brand-error/25 bg-brand-error/5' : 'bg-brand-surfaceSoft/30'}`}>
            <h3 className={`font-extrabold text-xs uppercase tracking-widest border-b pb-2 mb-3 ${p.complications ? 'text-brand-error border-brand-error/15' : 'text-brand-ink border-brand-hairlineSoft'}`}>
              Complications & Observations
            </h3>
            <p className={`text-xs leading-relaxed font-semibold ${p.complications ? 'text-brand-error' : 'text-brand-mute'}`}>
              {p.complications || 'No primary complications or clinical warnings reported.'}
            </p>
          </div>

          {/* Row 4: Surgeon Notes Block */}
          <div className="card-premium bg-brand-surfaceSoft/20 border-brand-hairlineSoft">
            <h3 className="font-extrabold text-xs text-brand-mute uppercase tracking-widest mb-2">
              Clinician Summary Notes
            </h3>
            <p className="text-xs text-brand-mute italic leading-relaxed font-medium">
              "{p.notes || 'No general summary notes recorded for this patient profile.'}"
            </p>
          </div>

        </div>

        {/* Notes writing module and historic logs */}
        <div className="flex flex-col gap-6">
          <div className="card-premium">
            <h3 className="font-bold text-brand-ink mb-3">Add Clinical Note</h3>
            <textarea
              className="input-premium h-24 mb-3"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Record a clinical observation, ROM changes, plan adjustments..."
            />
            <button 
              onClick={saveNote} 
              disabled={savingNote || !note.trim()} 
              className="btn-brand-primary w-full py-2.5 flex items-center justify-center gap-1.5 text-white font-bold shadow-none"
            >
              <Plus size={16} />
              Save Note
            </button>
          </div>

          {/* Clinical note history feed */}
          <div className="card-premium max-h-[300px] overflow-y-auto">
            <h3 className="font-bold text-brand-ink mb-3 border-b border-brand-hairlineSoft pb-1">Notes History ({notesList.length})</h3>
            <div className="space-y-3">
              {notesList.length === 0 ? (
                <p className="text-xs text-brand-mute italic font-bold">No notes recorded yet.</p>
              ) : (
                notesList.map((n) => (
                  <div key={n._id} className="bg-brand-surfaceSoft p-3 rounded-[16px] border border-brand-hairlineSoft text-xs font-semibold text-brand-charcoal">
                    <p className="text-brand-charcoal font-bold mb-1.5">{n.note}</p>
                    <div className="flex justify-between items-center text-[10px] text-brand-mute">
                      <span className="flex items-center gap-1">
                        <Calendar size={10} />
                        {new Date(n.createdAt).toLocaleDateString()}
                      </span>
                      {n.tags && n.tags[0] && (
                        <span className="bg-brand-primary/10 text-brand-primary px-1.5 py-0.5 rounded-full border border-brand-primary/15 font-bold">
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
          <div className="card-premium">
            <h3 className="font-extrabold mb-4 text-brand-ink tracking-tight">Quad Circumference Trend</h3>
            <TrendLine data={chart} keyName="quad" label="Operated Quad size" strokeColor="#e60023" />
          </div>
          
          <div className="card-premium">
            <h3 className="font-extrabold mb-4 text-brand-ink tracking-tight">Joint Flexion Range Trend</h3>
            <TrendLine data={chart} keyName="flexion" label="Flexion angle" strokeColor="#e60023" />
          </div>
        </div>
      )}
    </Layout>
  );
}
