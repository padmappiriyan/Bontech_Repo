import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FiMoreHorizontal, FiRepeat, FiChevronDown, FiEye, FiCheckCircle, FiEdit3 } from 'react-icons/fi';

const SharedTransactionList = ({ 
    transactions = [], 
    loading = false, 
    timeRange = 'all', 
    setTimeRange,
    onViewDetail,
    isAdmin = false,
    onExport,
    isExporting
}) => {
    const navigate = useNavigate();
    const [openMenuId, setOpenMenuId] = useState(null);

    const TABS = [
        { id: 'all', label: 'All' },
        { id: 'today', label: 'Today' },
        { id: 'yesterday', label: 'Yesterday' },
        { id: 'week', label: 'Last Week' },
        { id: 'month', label: 'Last Month' },
        { id: 'year', label: 'Last Year' }
    ];

    const formatDate = (dateString) => {
        const d = new Date(dateString);
        return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
    };

    const formatId = (id = '') => {
        if (!id) return '';
        const str = `0x${id.toString()}`;
        if (str.length <= 20) return str;
        return `${str.substring(0, 12)}...${str.substring(str.length - 12)}`;
    };

    const getStatusStyle = (status) => {
        switch (status?.toLowerCase()) {
            case 'active':
                return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'pending_change':
                return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'deleted':
                return 'bg-rose-50 text-rose-600 border-rose-100';
            default:
                return 'bg-neutral-50 text-neutral-600 border-neutral-100';
        }
    };

    return (
        <div className="bg-white rounded-[1.5rem] p-6 lg:p-8 w-full border border-neutral-100 shadow-sm relative overflow-hidden h-full flex flex-col">
            {/* Header section matching Image 3 precisely */}
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-[#1a1f36] text-[17px] font-bold tracking-tight">Transactions history</h2>
                <div className="flex items-center gap-2">
                    {onExport && (
                        <button
                            onClick={onExport}
                            disabled={isExporting}
                            className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-neutral-900 border border-neutral-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-neutral-800 transition-all disabled:opacity-50"
                        >
                            {isExporting ? 'Preparing...' : 'Export CSV'}
                        </button>
                    )}
                    <button className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400 hover:text-neutral-700 hover:bg-neutral-50 transition-colors border border-transparent hover:border-neutral-200">
                        <FiMoreHorizontal size={18} />
                    </button>
                </div>
            </div>

            {/* Filter Tabs matching Image 3 precisely */}
            <div className="flex items-center gap-2 mb-8 overflow-x-auto no-scrollbar pb-2">
                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setTimeRange(tab.id)}
                        className={`px-5 py-2 rounded-full text-[13px] font-semibold transition-all whitespace-nowrap border
                            ${timeRange === tab.id 
                                ? 'bg-white text-[#1a1f36] border-neutral-200 shadow-sm' 
                                : 'bg-transparent text-[#8792a2] border-transparent hover:bg-neutral-50'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Table Header */}
            <div className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr_auto] gap-4 px-4 py-3 bg-neutral-50 border border-neutral-100 rounded-xl mb-4 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                <div>Transaction ID</div>
                <div>Date & Time</div>
                <div>Platform</div>
                <div>Status</div>
                <div>Type & Amount</div>
                <div className="w-8"></div>
            </div>

            {/* List Items matching requested table layout */}
            <div className="space-y-1 mb-6 relative max-h-[520px] overflow-y-auto no-scrollbar pr-2">
                {loading && (
                    <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] z-10 flex items-center justify-center rounded-xl">
                        <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                )}
                
                <AnimatePresence mode="popLayout">
                    {transactions.map((tx) => (
                        <motion.div
                            key={tx.id || tx._id}
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr_auto] gap-4 px-4 py-4 items-center group hover:bg-[#f8f9fc] rounded-xl border border-transparent hover:border-neutral-100 transition-colors relative"
                        >
                            {/* Transaction ID */}
                            <div className="text-[13px] font-semibold text-[#1a1f36] flex items-center gap-3">
                                {formatId(tx.id || tx._id)}
                            </div>

                            {/* Date & Time */}
                            <div className="text-[13px] text-[#64748b] font-medium whitespace-nowrap">
                                {formatDate(tx.createdAt)}
                            </div>

                            {/* Platform */}
                            <div className="text-[13px] font-bold text-[#1a1f36]">
                                {(tx.platform || 'System').toUpperCase()}
                            </div>

                            {/* Status */}
                            <div>
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight border ${getStatusStyle(tx.status)}`}>
                                    {(tx.status || 'active').replace('_', ' ')}
                                </span>
                            </div>

                            {/* Type & Amount */}
                            <div className="flex flex-col">
                                <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest">
                                    {tx.type || 'Transaction'}
                                </span>
                                <span className="text-[14px] font-black text-brand-600">
                                    € {Number(tx.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                            </div>

                            {/* Action Menu attached to each item */}
                            <div className="relative w-8 flex justify-end">
                                <button 
                                    onClick={() => setOpenMenuId(openMenuId === (tx.id || tx._id) ? null : (tx.id || tx._id))}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 text-neutral-400 hover:text-indigo-600 rounded-md hover:bg-white border border-transparent hover:border-neutral-200 shadow-sm"
                                >
                                    <FiMoreHorizontal size={16} />
                                </button>
                                
                                {openMenuId === (tx.id || tx._id) && (
                                    <>
                                        <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                                        <div className="absolute right-0 top-8 mt-1 w-44 bg-white rounded-xl border border-neutral-100 shadow-xl z-20 py-1.5 overflow-hidden">
                                            <button 
                                                onClick={() => { onViewDetail(tx); setOpenMenuId(null); }}
                                                className="w-full flex items-center gap-3 px-4 py-2 text-[12px] font-bold uppercase tracking-wide text-neutral-600 hover:bg-[#f8f9fc] hover:text-indigo-600 transition-colors"
                                            >
                                                <FiEye size={15} /> View Details
                                            </button>
                                            {!isAdmin && (tx.status === 'active' || !tx.status) && (
                                                <button 
                                                    onClick={() => { navigate(`/dashboard/transactions/${tx.id || tx._id}/change-request`); setOpenMenuId(null); }}
                                                    className="w-full flex items-center gap-3 px-4 py-2 text-[12px] font-bold uppercase tracking-wide text-indigo-600 hover:bg-indigo-50 transition-colors"
                                                >
                                                    <FiEdit3 size={14} /> Request Change
                                                </button>
                                            )}
                                            {isAdmin && (
                                                <button className="w-full flex items-center gap-3 px-4 py-2 text-[12px] font-bold uppercase tracking-wide text-[#2563eb] hover:bg-[#eff6ff] transition-colors">
                                                    <FiCheckCircle size={15} /> Action Record
                                                </button>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    ))}

                    {transactions.length === 0 && !loading && (
                        <div className="text-center py-16 text-[#8792a2] font-medium text-[13px]">
                            No transactions found for the selected timeframe.
                        </div>
                    )}
                </AnimatePresence>
            </div>

            {/* View All Button matching Image 3 precisely */}
            <div className="flex justify-center mt-6">
                <button className="flex items-center gap-2 text-[13px] font-semibold text-[#8792a2] hover:text-[#1a1f36] transition-colors py-2 px-4 rounded-xl hover:bg-neutral-50 border border-transparent hover:border-neutral-200">
                    View all transactions <FiChevronDown size={14} strokeWidth={3} />
                </button>
            </div>
        </div>
    );
};

export default SharedTransactionList;
