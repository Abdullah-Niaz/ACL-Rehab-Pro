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
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Patients Directory</h2>
          <p className="text-xs text-slate-500 mt-1">Manage physical parameters, plans, and messaging profiles.</p>
        </div>
        
        <Link 
          to="/doctor/patients/new" 
          className="btn-brand-primary self-start flex items-center gap-2 py-3 px-5 text-white font-semibold shadow-md shadow-blue-100"
        >
          <UserPlus size={18} />
          Add Patient
        </Link>
      </div>

      {/* Filters & search panel */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-premium mb-6 flex flex-col md:flex-row gap-4 items-center justify-between select-none">
        
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search by patient name or email..."
            className="input-premium pl-10"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
          />
        </div>

        {/* Action Filters dropdowns */}
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto items-center">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter size={16} className="text-slate-400" />
            <select
              className="input-premium py-2 text-xs font-semibold text-slate-700 bg-slate-50"
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
            className="input-premium py-2 text-xs font-semibold text-slate-700 bg-slate-50 w-full sm:w-auto"
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
        <p className="animate-pulse">Loading active patient list...</p>
      ) : filteredPatients.length === 0 ? (
        <div className="card-premium text-center py-16 text-slate-500 font-medium">
          <p className="text-slate-400 mb-2">No patients matching filters found.</p>
          <button 
            onClick={() => { setSearch(''); setSportFilter('All'); setStatusFilter('All'); }}
            className="text-xs text-blue-600 font-bold hover:underline"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="card-premium p-0 border border-slate-200 overflow-hidden select-none">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                  <tr>
                    <th 
                      onClick={() => handleSort('name')} 
                      className="p-4 font-extrabold cursor-pointer hover:bg-slate-100/50 transition"
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
                      className="p-4 font-extrabold cursor-pointer hover:bg-slate-100/50 transition"
                    >
                      <div className="flex items-center gap-1.5">
                        Quad Symmetry
                        <ArrowUpDown size={12} />
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSort('phase')} 
                      className="p-4 font-extrabold cursor-pointer hover:bg-slate-100/50 transition"
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
                <tbody className="divide-y divide-slate-100">
                  {paginatedPatients.map((p) => {
                    const isUserActive = p.userId?.isActive;
                    const sym = quadSymmetry(p.operatedQuad, p.healthyQuad);
                    return (
                      <tr key={p._id} className="hover:bg-slate-50/50 transition">
                        <td className="p-4 font-bold text-slate-900">
                          <Link className="text-blue-600 hover:text-blue-800" to={`/doctor/patients/${p._id}`}>
                            {p.userId?.name}
                          </Link>
                          <span className="block text-xs font-normal text-slate-500 mt-0.5">{p.userId?.email}</span>
                        </td>
                        <td className="p-4 text-slate-600 font-semibold">{p.sport || 'N/A'}</td>
                        <td className="p-4 text-slate-600 font-medium">
                          <span className="text-xs text-slate-700 block">{p.graftType || 'N/A'}</span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">{p.graftSize || 'N/A'}</span>
                        </td>
                        <td className="p-4 font-extrabold">
                          <span className={`inline-flex items-center rounded-lg px-2.5 py-0.5 text-xs font-bold ${
                            sym >= 90 ? 'bg-emerald-50 text-emerald-700' : sym >= 75 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'
                          }`}>
                            {sym}%
                          </span>
                        </td>
                        <td className="p-4 text-slate-600 font-bold">Phase {p.currentPhase} <span className="text-xs font-normal text-slate-400">(W{p.currentWeek})</span></td>
                        <td className="p-4">
                          {isUserActive ? (
                            <span className="badge-success text-[10px] uppercase font-extrabold">
                              Active
                            </span>
                          ) : (
                            <span className="badge-warning text-[10px] uppercase font-extrabold animate-pulse">
                              Pending Setup
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex gap-2.5 justify-end">
                            <Link 
                              title="Daily Recovery Logs"
                              to={`/doctor/patients/${p._id}/progress`}
                              className="p-2 border border-slate-200/80 rounded-xl bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition"
                            >
                              <LineChart size={15} />
                            </Link>
                            
                            <Link 
                              title="Rehabilitation Plan"
                              to={`/doctor/patients/${p.userId?._id}/plan`}
                              className="p-2 border border-slate-200/80 rounded-xl bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition"
                            >
                              <FileText size={15} />
                            </Link>

                            <Link 
                              title="Secure Message Thread"
                              to={`/doctor/messages/${p.userId?._id}`}
                              className="p-2 border border-slate-200/80 rounded-xl bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition relative"
                            >
                              <MessageSquare size={15} />
                              {p.unreadMessagesCount > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[9px] font-bold text-white shadow-sm border border-white">
                                  {p.unreadMessagesCount}
                                </span>
                              )}
                            </Link>

                            <Link 
                              title="Edit Clinical details"
                              to={`/doctor/patients/${p._id}/edit`}
                              className="p-2 border border-slate-200/80 rounded-xl bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition"
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
            <div className="flex justify-between items-center text-xs font-semibold text-slate-500 px-1 select-none">
              <span>Showing Page {currentPage} of {totalPages}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="p-2 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 disabled:opacity-50 transition"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 disabled:opacity-50 transition"
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
