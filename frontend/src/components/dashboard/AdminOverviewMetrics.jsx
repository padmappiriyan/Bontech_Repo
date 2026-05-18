import React from 'react';
import {
    Building2,
    ArrowUpRight,
    ArrowDownLeft,
    Zap,
    TrendingUp,
    TrendingDown
} from 'lucide-react';
import { motion } from 'framer-motion';

const AdminOverviewMetrics = ({ data = {}, totalUsers = 0 }) => {
    // Hardcoded defaults as requested by user
    const stats = [
        {
            label: 'TOTAL BROUGHT FWD',
            value: data.broughtFwd ?? 0,
            subtext: `Sum of ${totalUsers || 0} active branches`,
            icon: Building2,
            color: 'text-neutral-400',
            bgColor: 'bg-neutral-50',
            trend: null
        },
        {
            label: 'TOTAL SEND',
            value: data.totalSend ?? 0,
            subtext: 'Net customer collection',
            icon: ArrowUpRight,
            color: 'text-emerald-500',
            bgColor: 'bg-emerald-50',
            trend: 'up',
            trendColor: 'text-emerald-500'
        },
        {
            label: 'TOTAL DEPOSIT',
            value: data.totalDeposit ?? 0,
            subtext: '18% vs last today',
            icon: ArrowDownLeft,
            color: 'text-emerald-500',
            bgColor: 'bg-emerald-50',
            trend: 'down',
            trendColor: 'text-emerald-500'
        },
        {
            label: 'TOTAL PAID',
            value: data.totalPaid ?? 0,
            subtext: '4% vs last today',
            icon: Zap,
            color: 'text-indigo-500',
            bgColor: 'bg-indigo-50',
            trend: 'down',
            trendColor: 'text-slate-400'
        }
    ];

    const platformNet = {
        label: 'PLATFORM NET',
        value: data.platformNet ?? 0,
        subtext: 'Stable liquidity',
        icon: Building2,
        currency: 'LKR',
        trend: 'up'
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {stats.map((stat, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-white rounded-[1.5rem] p-5 shadow-sm border border-neutral-100 flex flex-col justify-start min-h-[140px] hover:shadow-md transition-shadow relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-20 h-20 bg-neutral-50/50 rounded-full -mr-10 -mt-10" />

                        <div className="flex flex-col relative z-10">
                            <div className="flex items-center gap-2 mb-4">
                                <div className={`${stat.bgColor} p-2 rounded-lg shadow-sm`}>
                                    <stat.icon size={14} className={stat.color} />
                                </div>
                                <span className="text-[10px] font-bold uppercase  text-neutral-400">
                                    {stat.label}
                                </span>
                            </div>

                            <div>
                                <div className="text-[22px] font-black text-slate-900 tracking-tighter leading-tight truncate">
                                    {typeof stat.value === 'number' ? stat.value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 }) : stat.value}
                                </div>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    {stat.trend && (
                                        <div className={`${stat.trend === 'up' ? 'bg-rose-50' : 'bg-emerald-50'} p-0.5 rounded-md`}>
                                            {stat.trend === 'up' ?
                                                <ArrowUpRight size={10} className={stat.trendColor} /> :
                                                <ArrowDownLeft size={10} className={stat.trendColor} />
                                            }
                                        </div>
                                    )}
                                    <span className={`text-[9px] font-bold ${stat.trend ? stat.trendColor : 'text-neutral-400 opacity-60'}`}>
                                        {stat.subtext}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}

                {/* Platform Net - Dark Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="bg-[#0F172A] rounded-[1.5rem] p-5 shadow-xl flex flex-col justify-start min-h-[140px] text-white relative overflow-hidden group border border-slate-800"
                >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-brand-500/10 blur-3xl rounded-full -mr-12 -mt-12 group-hover:bg-brand-500/20 transition-colors" />

                    <div className="flex flex-col relative z-10">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="bg-brand-500/20 p-2 rounded-lg">
                                <platformNet.icon size={14} className="text-brand-400" />
                            </div>
                            <span className="text-[8px] font-black uppercase tracking-[0.25em] text-slate-400">
                                {platformNet.label}
                            </span>
                        </div>

                        <div>
                            <div className="flex items-baseline gap-1.5">
                                <span className="text-[10px] font-black text-slate-500">{platformNet.currency}</span>
                                <div className="text-[22px] font-black text-white tracking-tighter leading-tight truncate">
                                    {typeof platformNet.value === 'number' ? platformNet.value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 }) : platformNet.value}
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <div className="bg-brand-500/20 p-0.5 rounded-md">
                                    <ArrowUpRight size={10} className="text-brand-400" />
                                </div>
                                <span className="text-[9px] font-black text-brand-400 uppercase tracking-wider">
                                    {platformNet.subtext}
                                </span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default AdminOverviewMetrics;
