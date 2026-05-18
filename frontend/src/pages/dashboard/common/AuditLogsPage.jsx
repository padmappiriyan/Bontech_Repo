import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FiSearch, FiFilter, FiCalendar, FiShield, FiChevronLeft, 
    FiChevronRight, FiUser, FiActivity, FiFileText, FiInfo, FiX, FiChevronDown
} from 'react-icons/fi';
import { getAuditLogs } from '../../../api/auditLogApi';
import { getAllUsers } from '../../../api/userApi';
import useAuthRoles from '../../../hooks/useAuthRoles';
import { format } from 'date-fns';

// ── Constants & Helpers ──
const ACTION_CONFIG = {
    CREATE: { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', label: 'Transaction Recorded' },
    UPDATE: { color: 'bg-amber-100 text-amber-700 border-amber-200', label: 'Transaction Modified' },
    EXPORT: { color: 'bg-indigo-100 text-indigo-700 border-indigo-200', label: 'Ledger Exported' },
    DELETE: { color: 'bg-red-100 text-red-700 border-red-200', label: 'Record Deleted' },
    DEFAULT: { color: 'bg-neutral-100 text-neutral-500 border-neutral-200', label: 'Activity Logged' }
};

const AuditLogCard = ({ log, idx }) => {
    const config = ACTION_CONFIG[log.action] || ACTION_CONFIG.DEFAULT;
    
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ delay: idx * 0.05 }}
            className="group bg-white rounded-[24px] p-5 shadow-[0_2px_15px_rgb(0,0,0,0.02)] border border-neutral-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:border-indigo-100 transition-all duration-300 flex items-center justify-between"
        >
            <div className="flex items-center gap-5 flex-1">
                <div className="flex items-center gap-4 min-w-[240px]">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 flex items-center justify-center text-indigo-600 font-black text-sm shadow-sm">
                        {log.userId?.email?.[0]?.toUpperCase() || 'S'}
                    </div>
                    <div>
                        <h4 className="text-sm font-black text-brand-600 tracking-tight truncate max-w-[160px]">
                            {log.userId?.email?.split('@')[0] || 'SYSTEM'}
                        </h4>
                        <p className="text-[10px] font-bold text-brand-400 uppercase tracking-tight mt-0.5">
                            {log.userId?.role || 'Administrator'}
                        </p>
                    </div>
                </div>

                <div className="flex-1 px-4">
                    <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-lg text-[9px] font-black tracking-tight uppercase border ${config.color}`}>
                            {log.action}
                        </span>
                        <p className="text-sm font-bold text-brand-700 tracking-tight">
                            {config.label}
                        </p>
                    </div>
                    <p className="text-[11px] text-neutral-400 font-medium mt-1 line-clamp-1">
                        Secured entry of {log.action.toLowerCase()} operation on target resource.
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-8">
                <div className="text-right">
                    <p className="text-xs font-black text-neutral-600 tracking-tight">
                        {format(new Date(log.timestamp), 'dd MMM yyyy')}
                    </p>
                    <p className="text-[10px] font-bold text-neutral-400 tracking-widest mt-0.5">
                        {format(new Date(log.timestamp), 'HH:mm:ss')}
                    </p>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 rounded-xl hover:bg-neutral-50 text-neutral-400 hover:text-indigo-600 transition-colors">
                        <FiFileText size={16} />
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

const AuditLogsPage = () => {
    const { isAdminOrSupervisor } = useAuthRoles();
    
    const [logs, setLogs] = useState([]);
    const [usersList, setUsersList] = useState([]);
    const [meta, setMeta] = useState({ page: 1, pages: 1, total: 0 });
    const [loading, setLoading] = useState(true);

    const [filters, setFilters] = useState({
        action: '',
        userId: '',
        startDate: '',
        endDate: '',
        pageNumber: 1,
        pageSize: 5
    });

    const fetchLogs = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getAuditLogs(filters);
            setLogs(response.data);
            setMeta({
                page: response.page,
                pages: response.pages,
                total: response.total
            });
        } catch (error) {
            console.error("Failed to fetch audit logs", error);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    const fetchDropdownData = useCallback(async () => {
        if (!isAdminOrSupervisor) return;
        try {
            const data = await getAllUsers({ limit: 100 });
            setUsersList(data.users || []);
        } catch (err) {
            console.error("Could not load users for filtering", err);
        }
    }, [isAdminOrSupervisor]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    useEffect(() => {
        fetchDropdownData();
    }, [fetchDropdownData]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value, pageNumber: 1 }));
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= meta.pages) {
            setFilters(prev => ({ ...prev, pageNumber: newPage }));
        }
    };

    return (
        <div className="p-4 md:p-8 mx-auto max-w-7xl">
            <div className="space-y-8">
                {/* ── Header ── */}
                <div className="flex items-center gap-3 px-2">
                    <FiActivity className="text-indigo-500" />
                    <h2 className="text-md font-bold text-brand-600 tracking-tight">
                        {isAdminOrSupervisor ? 'System Activity Stream' : 'My Activity Stream'}
                    </h2>
                </div>

                {/* ── Redesigned Filter Section (Full Width) ── */}
                <div className="bg-white rounded-[32px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-neutral-100">
                    {/* Top Row: Search & Status */}
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <div className="flex-[2] relative group">
                            <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-indigo-500 transition-colors z-10 size-5" />
                            <input
                                type="text"
                                placeholder="Search logs by activity or content..."
                                className="w-full pl-14 pr-6 py-4 rounded-[20px] bg-neutral-50/50 border border-neutral-100 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all text-[13px] font-medium text-neutral-700 placeholder:text-neutral-400"
                            />
                        </div>
                        
                        <div className="flex-1 relative group">
                            <FiShield className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-400 group-hover:text-indigo-500 transition-colors z-10 pointer-events-none size-5" />
                            <select
                                name="action"
                                value={filters.action}
                                onChange={handleFilterChange}
                                className="w-full pl-14 pr-12 py-4 rounded-[20px] bg-neutral-50/50 border border-neutral-100 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all text-[13px] font-bold text-neutral-600 appearance-none cursor-pointer"
                            >
                                <option value="">All Status</option>
                                {Object.keys(ACTION_CONFIG).filter(k => k !== 'DEFAULT').map(key => (
                                    <option key={key} value={key}>{ACTION_CONFIG[key].label}</option>
                                ))}
                            </select>
                            <FiChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none size-4" />
                        </div>

                        {isAdminOrSupervisor && (
                            <div className="flex-1 relative group">
                                <FiUser className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-400 group-hover:text-indigo-500 transition-colors z-10 pointer-events-none size-5" />
                                <select
                                    name="userId"
                                    value={filters.userId}
                                    onChange={handleFilterChange}
                                    className="w-full pl-14 pr-12 py-4 rounded-[20px] bg-neutral-50/50 border border-neutral-100 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all text-[13px] font-bold text-neutral-600 appearance-none cursor-pointer"
                                >
                                    <option value="">All Users</option>
                                    {usersList.map(u => (
                                        <option key={u.id} value={u.id}>{u.name.split(' ')[0]} ({u.role})</option>
                                    ))}
                                </select>
                                <FiChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none size-4" />
                            </div>
                        )}
                    </div>

                    {/* Bottom Row: Dates & Clear */}
                    <div className="flex flex-col md:flex-row items-end gap-4">
                        <div className="flex-1 space-y-2.5">
                            <label className="text-[10px] font-black text-[#8792a2] uppercase tracking-[0.15em] ml-1">Last Updated From</label>
                            <div className="relative group">
                                <input
                                    type="date"
                                    name="startDate"
                                    value={filters.startDate}
                                    onChange={handleFilterChange}
                                    className="w-full pl-5 pr-12 py-4 rounded-[20px] bg-neutral-50/50 border border-neutral-100 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all text-[13px] font-bold text-neutral-700 cursor-pointer"
                                />
                                <FiCalendar className="absolute right-5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none size-5" />
                            </div>
                        </div>

                        <div className="flex-1 space-y-2.5">
                            <label className="text-[10px] font-black text-[#8792a2] uppercase tracking-[0.15em] ml-1">Last Updated To</label>
                            <div className="relative group">
                                <input
                                    type="date"
                                    name="endDate"
                                    value={filters.endDate}
                                    onChange={handleFilterChange}
                                    className="w-full pl-5 pr-12 py-4 rounded-[20px] bg-neutral-50/50 border border-neutral-100 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all text-[13px] font-bold text-neutral-700 cursor-pointer"
                                />
                                <FiCalendar className="absolute right-5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none size-5" />
                            </div>
                        </div>

                        <div className="pb-1.5 px-2">
                            <button
                                onClick={() => setFilters({
                                    action: '',
                                    userId: '',
                                    startDate: '',
                                    endDate: '',
                                    pageNumber: 1,
                                    pageSize: 5
                                })}
                                className="text-[11px] font-black text-indigo-600 hover:text-indigo-700 uppercase tracking-widest px-4 py-2 transition-all hover:scale-105 active:scale-95"
                            >
                                Clear Filters
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── Audit Logs List ── */}
                <div className="relative">
                    {loading && (
                        <div className="absolute inset-x-0 top-0 h-2 z-20">
                            <div className="h-full bg-indigo-500/10 overflow-hidden rounded-full">
                                <motion.div
                                    className="h-full bg-indigo-500"
                                    initial={{ width: "0%" }}
                                    animate={{ width: "100%" }}
                                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                                />
                            </div>
                        </div>
                    )}

                    <div className="space-y-3">
                        <AnimatePresence mode='popLayout'>
                            {!loading && logs.length === 0 ? (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="bg-white rounded-[32px] p-20 text-center border border-dashed border-neutral-200 outline outline-8 outline-neutral-50/50"
                                >
                                    <div className="flex flex-col items-center gap-6">
                                        <div className="w-24 h-24 bg-neutral-50 rounded-full flex items-center justify-center text-neutral-300">
                                            <FiShield size={48} />
                                        </div>
                                        <div>
                                            <p className="text-xl font-black text-neutral-800 tracking-tight">No records detected</p>
                                            <p className="text-sm text-neutral-400 font-medium mt-1">The audit vault is currently empty for these parameters.</p>
                                        </div>
                                    </div>
                                </motion.div>
                            ) : (
                                logs.map((log, idx) => (
                                    <AuditLogCard key={log._id} log={log} idx={idx} />
                                ))
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* ── Pagination ── */}
                <div className="mt-2 flex items-center justify-between bg-white rounded-[24px] p-4 shadow-sm border border-neutral-100">
                    <p className="text-[11px] font-bold text-neutral-400 tracking-wider px-4">
                        PAGE <span className="text-neutral-900 font-black">{meta.page}</span> / {meta.pages || 1}
                        <span className="mx-4 text-neutral-200">|</span>
                        TOTAL <span className="text-indigo-600 font-black">{meta.total}</span> LOGS
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => handlePageChange(meta.page - 1)}
                            disabled={meta.page === 1 || loading}
                            className="px-4 py-2 rounded-xl border border-neutral-100 text-[11px] font-black uppercase tracking-widest text-neutral-600 hover:bg-neutral-50 disabled:opacity-30 transition-all font-bold"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => handlePageChange(meta.page + 1)}
                            disabled={meta.page === meta.pages || loading}
                            className="px-4 py-2 rounded-xl bg-neutral-900 text-white text-[11px] font-black uppercase tracking-widest hover:bg-neutral-800 disabled:opacity-30 transition-all shadow-lg shadow-neutral-200 font-bold"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuditLogsPage;
