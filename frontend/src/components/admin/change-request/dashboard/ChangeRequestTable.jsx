import React from 'react';
import { FiArrowRight, FiCheckCircle, FiClock, FiXCircle, FiMessageSquare, FiExternalLink } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

const StatusBadge = ({ status }) => {
    const config = {
        pending: {
            bg: 'bg-amber-50',
            text: 'text-amber-700',
            border: 'border-amber-200/50',
            icon: <FiClock size={12} />,
            label: 'Pending'
        },
        approved: {
            bg: 'bg-emerald-50',
            text: 'text-emerald-700',
            border: 'border-emerald-200/50',
            icon: <FiCheckCircle size={12} />,
            label: 'Approved'
        },
        rejected: {
            bg: 'bg-rose-50',
            text: 'text-rose-700',
            border: 'border-rose-200/50',
            icon: <FiXCircle size={12} />,
            label: 'Rejected'
        }
    };

    const { bg, text, border, icon, label } = config[status] || config.pending;

    return (
        <span className={`px-2.5 py-1 rounded-full ${bg} ${text} ${border} border text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 w-fit shadow-xs`}>
            {icon} {label}
        </span>
    );
};

const ChangeRequestTable = ({ requests, loading, onRowClick }) => {
    const [currentPage, setCurrentPage] = React.useState(1);
    const itemsPerPage = 8;

    React.useEffect(() => {
        setCurrentPage(1);
    }, [requests]);

    if (loading && requests.length === 0) {
        return (
            <div className="w-full h-80 bg-white rounded-[1.5rem] border border-slate-100 p-10 flex items-center justify-center animate-pulse">
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Scanning Ledger Records...</span>
            </div>
        );
    }

    if (requests.length === 0) {
        return (
            <div className="w-full h-80 bg-white rounded-[1.5rem] border border-slate-100 p-10 flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-200">
                    <FiMessageSquare size={24} />
                </div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">No Requests Found</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-loose text-center">All data synchronization points are currently stable.</p>
            </div>
        );
    }

    const totalPages = Math.ceil(requests.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedRequests = requests.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div className="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
            <div className="overflow-x-auto custom-scrollbar flex-1">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="border-b border-slate-50 text-left">
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Transaction ID</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Requester</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Attribute</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Modification</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Timeline</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Status</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Review</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50/50">
                        {paginatedRequests.map((request, idx) => {
                            const isApproved = request.status === 'approved' || request.status === 'rejected';

                            return (
                                <motion.tr 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: idx * 0.03 }}
                                    key={request.id || request._id}
                                    className={`group transition-colors ${isApproved ? 'bg-slate-50 cursor-not-allowed opacity-80' : 'hover:bg-slate-50/50 cursor-pointer'}`}
                                    onClick={() => {
                                        if (!isApproved) {
                                            onRowClick(request);
                                        }
                                    }}
                                >

                                <td className="px-6 py-4 font-black text-slate-900 text-[13px] tracking-tight">
                                    TRX-{(request.transactionId?.id || request.transactionId?._id)?.slice(-8) || 'Unknown'}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-7 h-7 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600 font-bold text-[10px]">
                                            {request.requestedBy?.name?.[0]}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[12px] font-black text-slate-900 tracking-tight leading-none mb-0.5">{request.requestedBy?.name}</span>
                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{request.requestedBy?.role}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-bold text-slate-600 capitalize">
                                        {request.field}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[11px] font-bold text-rose-500 line-through opacity-40">{request.oldValue}</span>
                                        <FiArrowRight size={10} className="text-slate-300" />
                                        <span className="text-[11px] font-black text-emerald-600">{request.newValue}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className="text-[10px] font-black text-slate-900 tracking-tight underline decoration-brand-200 underline-offset-4">
                                        {format(new Date(request.createdAt), 'MMM dd, HH:mm')}
                                    </span>
                                </td>
                                <td className="px-6 py-4 flex justify-center">
                                    <StatusBadge status={request.status} />
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="w-7 h-7 rounded-lg bg-slate-100 text-slate-400 flex items-center justify-center group-hover:bg-brand-50 group-hover:text-brand-600 transition-all opacity-0 group-hover:opacity-100">
                                        <FiExternalLink size={14} />
                                    </button>
                                </td>
                            </motion.tr>
                        );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Table Footer */}
            <div className="px-6 py-4 bg-slate-50/50 flex justify-between items-center border-t border-slate-50">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Showing <span className="text-slate-900">{startIndex + 1} - {Math.min(startIndex + itemsPerPage, requests.length)}</span> of <span className="text-slate-900">{requests.length}</span> records
                </span>
                <div className="flex gap-2">
                    <button 
                        onClick={(e) => { e.stopPropagation(); setCurrentPage(p => Math.max(1, p - 1)); }}
                        disabled={currentPage === 1}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-100 transition-all ${currentPage === 1 ? 'opacity-30 cursor-not-allowed bg-transparent' : 'bg-white text-slate-600 hover:border-slate-300'}`}
                    >
                        Previous
                    </button>
                    <button 
                        onClick={(e) => { e.stopPropagation(); setCurrentPage(p => Math.min(totalPages, p + 1)); }}
                        disabled={currentPage === totalPages}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-100 transition-all ${currentPage === totalPages ? 'opacity-30 cursor-not-allowed bg-transparent' : 'bg-white text-slate-600 hover:border-slate-300'}`}
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChangeRequestTable;
