import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import api from '../../api/client';
import { quadSymmetry } from '../../utils/calculations';
import { 
  UserPlus, Search, ArrowUpDown, ChevronLeft, ChevronRight,
  Edit, MessageSquare, LineChart, FileText, Filter
} from 'lucide-react';

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filtering & Sorting State
  const [search, setSearch] = useState('');
  const [sportFilter, setSportFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('name'); // 'name', 'symmetry', 'phase'
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc', 'desc'

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    api.get('/doctor/patients')
      .then(r => {
        setPatients(r.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  // Compute list of unique sports for the filter dropdown
  const uniqueSports = useMemo(() => {
    const sports = new Set();
    patients.forEach(p => {
      if (p.sport) {
        p.sport.split(',').forEach(s => sports.add(s.trim()));
      }
    });
    return ['All', ...Array.from(sports)];
  }, [patients]);

  // Handle Toggle Sort Order
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // Filtered and Sorted list
  const filteredPatients = useMemo(() => {
    let result = [...patients];

    // 1. Text Search Filter
    if (search.trim() !== '') {
      const q = search.toLowerCase();
      result = result.filter(p => 
        p.userId?.name?.toLowerCase().includes(q) || 
        p.userId?.email?.toLowerCase().includes(q)
      );
    }

    // 2. Sport Filter
    if (sportFilter !== 'All') {
      result = result.filter(p => p.sport && p.sport.includes(sportFilter));
    }

    // 3. Status Filter (Active vs Pending)
    if (statusFilter !== 'All') {
      const wantActive = statusFilter === 'Active';
      result = result.filter(p => p.userId?.isActive === wantActive);
    }

    // 4. Sorting
    result.sort((a, b) => {
      let valA = '';
      let valB = '';

      if (sortBy === 'name') {
        valA = a.userId?.name || '';
        valB = b.userId?.name || '';
      } else if (sortBy === 'symmetry') {
        valA = quadSymmetry(a.operatedQuad, a.healthyQuad);
        valB = quadSymmetry(b.operatedQuad, b.healthyQuad);
      } else if (sortBy === 'phase') {
        valA = a.currentPhase || 0;
        valB = b.currentPhase || 0;
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [patients, search, sportFilter, statusFilter, sortBy, sortOrder]);

  // Paginated chunk
  const paginatedPatients = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredPatients.slice(start, start + itemsPerPage);
  }, [filteredPatients, currentPage]);

  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);

  return (
    <Layout role="doctor">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tighter text-brand-ink">Patients Directory</h2>
          <p className="text-xs text-brand-mute mt-1">Manage physical parameters, plans, and messaging profiles.</p>
        </div>
        
        <Link 
          to="/doctor/patients/new" 
          className="btn-brand-primary self-start flex items-center gap-2 py-3 px-5 text-white font-bold shadow-none"
        >
          <UserPlus size={18} />
          Add Patient
        </Link>
      </div>

      {/* Filters & search panel */}
      <div className="bg-brand-canvas p-4 rounded-[16px] border border-brand-hairlineSoft mb-6 flex flex-col md:flex-row gap-4 items-center justify-between select-none shadow-none">
        
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-ash" size={18} />
          <input
            type="text"
            placeholder="Search by patient name or email..."
            className="w-full rounded-full border border-brand-hairlineSoft bg-brand-surfaceCard pl-11 pr-4 py-2.5 text-sm outline-none transition-all placeholder:text-brand-ash focus:bg-brand-canvas focus:ring-4 focus:ring-brand-focusOuter/15"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
          />
        </div>

        {/* Action Filters dropdowns */}
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto items-center">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter size={16} className="text-brand-mute" />
            <select
              className="w-full sm:w-auto rounded-full border border-brand-hairlineSoft bg-brand-surfaceCard px-4 py-2 text-xs font-bold text-brand-charcoal outline-none transition-all focus:border-brand-ink focus:ring-4 focus:ring-brand-focusOuter/15 cursor-pointer"
              value={sportFilter}
              onChange={(e) => { setSportFilter(e.target.value); setCurrentPage(1); }}
            >
              <option value="All">All Sports</option>
              {uniqueSports.filter(s => s !== 'All').map(sport => (
                <option key={sport} value={sport}>{sport}</option>
              ))}
            </select>
          </div>

          <select
            className="w-full sm:w-auto rounded-full border border-brand-hairlineSoft bg-brand-surfaceCard px-4 py-2 text-xs font-bold text-brand-charcoal outline-none transition-all focus:border-brand-ink focus:ring-4 focus:ring-brand-focusOuter/15 cursor-pointer"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active Portal</option>
            <option value="Pending">Pending Invite</option>
          </select>
        </div>
      </div>

      {loading ? (
        <p className="animate-pulse text-brand-mute font-bold">Loading active patient list...</p>
      ) : filteredPatients.length === 0 ? (
        <div className="card-premium text-center py-16 text-brand-mute font-bold shadow-none">
          <p className="text-brand-ash mb-2 font-medium">No patients matching filters found.</p>
          <button 
            onClick={() => { setSearch(''); setSportFilter('All'); setStatusFilter('All'); }}
            className="text-xs text-brand-primary font-bold hover:underline"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="card-premium p-0 border border-brand-hairlineSoft overflow-hidden select-none shadow-none bg-brand-canvas">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-brand-surfaceCard border-b border-brand-hairlineSoft text-brand-mute uppercase tracking-wider text-[10px] font-bold">
                  <tr>
                    <th 
                      onClick={() => handleSort('name')} 
                      className="p-4 font-extrabold cursor-pointer hover:bg-brand-surfaceSoft/50 transition"
                    >
                      <div className="flex items-center gap-1.5">
                        Name
                        <ArrowUpDown size={12} />
                      </div>
                    </th>
                    <th className="p-4 font-extrabold">Sport</th>
                    <th className="p-4 font-extrabold">Graft Spec</th>
                    <th 
                      onClick={() => handleSort('symmetry')} 
                      className="p-4 font-extrabold cursor-pointer hover:bg-brand-surfaceSoft/50 transition"
                    >
                      <div className="flex items-center gap-1.5">
                        Quad Symmetry
                        <ArrowUpDown size={12} />
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSort('phase')} 
                      className="p-4 font-extrabold cursor-pointer hover:bg-brand-surfaceSoft/50 transition"
                    >
                      <div className="flex items-center gap-1.5">
                        Current Phase
                        <ArrowUpDown size={12} />
                      </div>
                    </th>
                    <th className="p-4 font-extrabold">Portal Status</th>
                    <th className="p-4 font-extrabold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-hairlineSoft">
                  {paginatedPatients.map((p) => {
                    const isUserActive = p.userId?.isActive;
                    const sym = quadSymmetry(p.operatedQuad, p.healthyQuad);
                    return (
                      <tr key={p._id} className="hover:bg-brand-surfaceSoft/30 transition">
                        <td className="p-4 font-bold text-brand-ink">
                          <div className="flex items-center flex-wrap gap-1.5">
                            <Link className="text-brand-ink hover:text-brand-primary font-bold" to={`/doctor/patients/${p._id}`}>
                              {p.userId?.name}
                            </Link>
                            {p.highRisk && (
                              <span className="inline-flex items-center rounded-full bg-brand-error/10 text-brand-error text-[8px] font-black uppercase tracking-wider px-2 py-0.5 border border-brand-error/20">
                                Risk Alert
                              </span>
                            )}
                            {p.readyForProgression && (
                              <span className="inline-flex items-center rounded-full bg-brand-successPale text-brand-successDeep text-[8px] font-black uppercase tracking-wider px-2 py-0.5 border border-brand-successDeep/10">
                                Ready to Progress
                              </span>
                            )}
                          </div>
                          <span className="block text-xs font-semibold text-brand-mute mt-0.5">{p.userId?.email}</span>
                        </td>
                        <td className="p-4 text-brand-charcoal font-bold">{p.sport || 'N/A'}</td>
                        <td className="p-4 text-brand-charcoal font-semibold">
                          <span className="text-xs text-brand-charcoal block">{p.graftType || 'N/A'}</span>
                          <span className="text-[10px] text-brand-mute block mt-0.5 font-bold">{p.graftSize || 'N/A'}</span>
                        </td>
                        <td className="p-4 font-extrabold">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold border ${
                            sym >= 90 ? 'bg-brand-successPale text-brand-successDeep border-brand-successDeep/10' : sym >= 75 ? 'bg-amber-50 text-amber-800 border-amber-200/50' : 'bg-brand-error/10 text-brand-error border-brand-error/20'
                          }`}>
                            {sym}%
                          </span>
                        </td>
                        <td className="p-4 text-brand-charcoal font-bold">Phase {p.currentPhase} <span className="text-xs font-semibold text-brand-mute">(W{p.currentWeek})</span></td>
                        <td className="p-4">
                          {isUserActive ? (
                            <span className="badge-success text-[10px] uppercase font-extrabold border-brand-successDeep/10">
                              Active
                            </span>
                          ) : (
                            <span className="badge-warning text-[10px] uppercase font-extrabold animate-pulse border-amber-200/55">
                              Pending Setup
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex gap-2.5 justify-end">
                            <Link 
                              title="Daily Recovery Logs"
                              to={`/doctor/patients/${p._id}/progress`}
                              className="p-2 border border-brand-hairlineSoft rounded-[16px] bg-brand-canvas hover:bg-brand-surfaceCard text-brand-charcoal transition"
                            >
                              <LineChart size={15} />
                            </Link>
                            
                            <Link 
                              title="Rehabilitation Plan"
                              to={`/doctor/patients/${p.userId?._id}/plan`}
                              className="p-2 border border-brand-hairlineSoft rounded-[16px] bg-brand-canvas hover:bg-brand-surfaceCard text-brand-charcoal transition"
                            >
                              <FileText size={15} />
                            </Link>
 
                            <Link 
                              title="Secure Message Thread"
                              to={`/doctor/messages/${p.userId?._id}`}
                              className="p-2 border border-brand-hairlineSoft rounded-[16px] bg-brand-canvas hover:bg-brand-surfaceCard text-brand-charcoal transition relative"
                            >
                              <MessageSquare size={15} />
                              {p.unreadMessagesCount > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-brand-primary text-[9px] font-bold text-white border border-brand-canvas">
                                  {p.unreadMessagesCount}
                                </span>
                              )}
                            </Link>
 
                            <Link 
                              title="Edit Clinical details"
                              to={`/doctor/patients/${p._id}/edit`}
                              className="p-2 border border-brand-hairlineSoft rounded-[16px] bg-brand-canvas hover:bg-brand-surfaceCard text-brand-charcoal transition"
                            >
                              <Edit size={15} />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Table pagination triggers */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center text-xs font-bold text-brand-mute px-1 select-none">
              <span>Showing Page {currentPage} of {totalPages}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="p-2 border border-brand-hairlineSoft rounded-[16px] bg-brand-canvas hover:bg-brand-surfaceCard disabled:opacity-30 transition"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 border border-brand-hairlineSoft rounded-[16px] bg-brand-canvas hover:bg-brand-surfaceCard disabled:opacity-30 transition"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </Layout>
  );
}
