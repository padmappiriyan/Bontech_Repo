import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiGlobe, FiSend, FiArrowUpRight, FiActivity, FiChevronDown, FiChevronUp
} from 'react-icons/fi';
import CompactTransactionEntry from '../transactions/CompactTransactionEntry';

const PlatformBalanceTable = ({ platforms, loading, isClosed }) => {
    const [expandedPlatformId, setExpandedPlatformId] = useState(null);

    if (loading && platforms.length === 0) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-64 bg-slate-50 animate-pulse rounded-[2rem] border border-slate-100" />
                ))}
            </div>
        );
    }

    // Helper to get stylized icon and color scheme based on platform name
    const getPlatformStyle = (name = '') => {
        const platform = name.toUpperCase();
        if (platform.includes('WESTERN UNION')) {
            return {
                icon: <FiGlobe />,
                bg: 'bg-[#FFF9E6]',
                text: 'text-[#D97706]',
                displayName: 'Western Union'
            };
        }
        if (platform.includes('MONEYGRAM')) {
            return {
                icon: <FiSend />,
                bg: 'bg-[#FFF1F2]',
                text: 'text-[#E11D48]',
                displayName: 'Moneygram'
            };
        }
        if (platform.includes('RIA')) {
            return {
                icon: <FiArrowUpRight />,
                bg: 'bg-[#FFF7ED]',
                text: 'text-[#EA580C]',
                displayName: 'Ria'
            };
        }
        return {
            icon: <FiActivity />,
            bg: 'bg-brand-50',
            text: 'text-brand-600',
            displayName: name
        };
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {platforms.map((platform, idx) => {
                const style = getPlatformStyle(platform.name);

                return (
                    <motion.div
                        key={platform.platformId || platform.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className={`bg-white rounded-[2rem] p-5 border border-[#F1F5F9] shadow-xl relative group hover:shadow-2xl transition-all duration-300 ${expandedPlatformId === (platform.platformId || platform.id) ? 'border-brand-500 shadow-2xl shadow-brand-500/10' : ''}`}
                    >
                        {/* Header: Platform Identity */}
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-[1rem] ${style.bg} ${style.text} flex items-center justify-center text-lg shadow-sm transition-transform group-hover:scale-105`}>
                                    {style.icon}
                                </div>
                                <h3 className="text-lg font-black text-[#1E293B] tracking-tight">{style.displayName}</h3>
                            </div>
                            <span className="text-[9px] font-bold text-neutral-300 uppercase tracking-widest border border-neutral-100 px-3 py-0.5 rounded-full">
                                Ledger
                            </span>
                        </div>

                        {/* Internal Ledger Table */}
                        <div className="space-y-2 px-1 pb-3">
                            {/* Row: Brought Fwd */}
                            <div className="flex justify-between items-center group/row">
                                <p className="text-xs font-bold text-neutral-500 whitespace-nowrap">Brought Fwd</p>
                                <p className="text-sm font-black text-[#1E293B] tracking-tight">
                                    {platform.openingBalanceLkr?.toLocaleString() || '0'}
                                </p>
                            </div>

                            {/* Row: Send */}
                            <div className="flex justify-between items-center group/row">
                                <p className="text-xs font-bold text-neutral-500 whitespace-nowrap">Send</p>
                                <div className="flex items-center gap-6">
                                    <span className="text-emerald-500 font-bold text-xs">+</span>
                                    <p className="text-sm font-black text-emerald-500 tracking-tight">
                                        {platform.todaySendLkr?.toLocaleString() || '0'}
                                    </p>
                                </div>
                            </div>

                            {/* Row: Paid */}
                            <div className="flex justify-between items-center group/row">
                                <p className="text-xs font-bold text-neutral-500 whitespace-nowrap">Paid</p>
                                <div className="flex items-center gap-6">
                                    <span className="text-indigo-500 font-bold text-xs">-</span>
                                    <p className="text-sm font-black text-indigo-500 tracking-tight">
                                        {platform.todayPaidLkr?.toLocaleString() || '0'}
                                    </p>
                                </div>
                            </div>

                            {/* Row: Deposit */}
                            <div className="flex justify-between items-center group/row mb-2">
                                <p className="text-xs font-bold text-neutral-500 whitespace-nowrap">Deposit</p>
                                <div className="flex items-center gap-6">
                                    <span className="text-rose-500 font-bold text-xs">-</span>
                                    <p className="text-sm font-black text-rose-500 tracking-tight">
                                        {platform.todayDepositLkr?.toLocaleString() || '0'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Footer: Balance */}
                        <div className={`mt-2 pt-4 border-t border-[#F1F5F9] flex justify-between items-center ${expandedPlatformId === (platform.platformId || platform.id) ? 'max-w-md' : ''}`}>
                            <p className="text-[10px] font-black text-[#1E293B] uppercase tracking-wider">Balance</p>
                            <p className="text-base font-black text-[#1E293B] tracking-tight">
                                <span className="text-[12px] font-bold mr-1">EUR (€)</span>
                                {platform.currentBalanceLkr?.toLocaleString() || '0'}
                            </p>
                        </div>

                        {/* Expanded Form Area */}
                        <AnimatePresence>
                            {expandedPlatformId === (platform.platformId || platform.id) && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="overflow-hidden mt-6 pt-6 border-t border-neutral-100"
                                >
                                    <CompactTransactionEntry
                                        initialPlatform={platform.slug || platform.platformId}
                                        onComplete={() => setExpandedPlatformId(null)}
                                        isClosed={isClosed}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Action Button: Initiate */}
                        <div className="mt-5">
                            <button
                                onClick={() => setExpandedPlatformId(expandedPlatformId === (platform.platformId || platform.id) ? null : (platform.platformId || platform.id))}
                                className={`w-full py-4 rounded-2xl flex items-center justify-center gap-4 transition-all duration-300 group/btn active:scale-[0.98] cursor-pointer font-bold uppercase text-sm
                                    ${expandedPlatformId === (platform.platformId || platform.id)
                                        ? 'bg-slate-50/40 backdrop-blur-xl border border-slate-200/60 text-slate-400 hover:bg-slate-100/60 hover:text-slate-600 shadow-inner'
                                        : 'bg-brand-600 hover:bg-brand-700 text-white shadow-2xl shadow-brand-600/30'}
                                `}
                            >
                                {expandedPlatformId === (platform.platformId || platform.id) ? (
                                    <FiChevronUp size={20} className="transition-transform duration-300 group-hover/btn:-translate-y-0.5" />
                                ) : (
                                    <FiChevronDown size={20} className="transition-transform duration-300 group-hover/btn:translate-y-0.5" />
                                )}
                                <span>
                                    {expandedPlatformId === (platform.platformId || platform.id) ? 'Close Form' : isClosed ? `View ${style.displayName} Ledger` : `Initiate via ${style.displayName}`}
                                </span>
                            </button>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
};

export default PlatformBalanceTable;
