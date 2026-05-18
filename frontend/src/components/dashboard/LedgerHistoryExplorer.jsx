import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { FiCalendar, FiActivity } from 'react-icons/fi';
import { fetchPlatformHistory } from '../../api/reportsApi';
import toast from 'react-hot-toast';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';

const LedgerHistoryExplorer = () => {
    const [rangeType, setRangeType] = useState('Last 7 Days'); // 'Last 7 Days', '30 Days', 'All Time', 'Custom'
    const [historyStartDate, setHistoryStartDate] = useState('');
    const [historyEndDate, setHistoryEndDate] = useState('');

    const [histories, setHistories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('Global Master');
    
    
    const { lastUpdated } = useSelector((state) => state.userBalance);

    // Handle Quick Ranges
    useEffect(() => {
        const today = new Date();
        const end = today.toISOString().split('T')[0];

        if (rangeType === 'Last 7 Days') {
            const start = new Date();
            start.setDate(today.getDate() - 7);
            setHistoryStartDate(start.toISOString().split('T')[0]);
            setHistoryEndDate(end);
        } else if (rangeType === '30 Days') {
            const start = new Date();
            start.setDate(today.getDate() - 30);
            setHistoryStartDate(start.toISOString().split('T')[0]);
            setHistoryEndDate(end);
        } else if (rangeType === 'All Time') {
            setHistoryStartDate('');
            setHistoryEndDate('');
        }
    }, [rangeType]);

    // Data Fetcher
    useEffect(() => {
        // Skip fetching if Custom is selected but dates aren't fully filled.
        if (rangeType === 'Custom' && (!historyStartDate || !historyEndDate)) {
            return;
        }

        const loadHistory = async () => {
            try {
                setLoading(true);
                const params = {};
                if (historyStartDate) params.startDate = historyStartDate;
                if (historyEndDate) params.endDate = historyEndDate;
                const data = await fetchPlatformHistory(params);
                setHistories(data);
            } catch (error) {
                console.error("Failed to fetch platform history:", error);
                toast.error("Failed to load ledger history.");
            } finally {
                setLoading(false);
            }
        };
        loadHistory();
    }, [rangeType, historyStartDate, historyEndDate, lastUpdated]);

    // Compute Global Master
    const globalHistory = useMemo(() => {
        if (!histories || histories.length === 0) return [];
        const dateMap = {};
        histories.forEach(platform => {
            platform.history.forEach(day => {
                if (!dateMap[day.date]) {
                    dateMap[day.date] = { date: day.date, send: 0, paid: 0, deposit: 0, balance: 0, bf: 0, originalFormat: day.date };
                }
                dateMap[day.date].send += day.send;
                dateMap[day.date].paid += day.paid;
                dateMap[day.date].deposit += day.deposit;
                dateMap[day.date].balance += day.balance;
                dateMap[day.date].bf += day.bf;
            });
        });
        return Object.values(dateMap).sort((a, b) => new Date(b.date) - new Date(a.date));
    }, [histories]);

    const tabs = ['Global Master', ...histories.map(h => h.name)];

    // Enforce selection safety if platforms change
    useEffect(() => {
        if (!tabs.includes(activeTab)) {
            setActiveTab('Global Master');
        }
    }, [tabs, activeTab]);

    const activeData = useMemo(() => {
        if (activeTab === 'Global Master') return globalHistory;
        const target = histories.find(h => h.name === activeTab);
        return target ? target.history : [];
    }, [activeTab, globalHistory, histories]);

    // Aggregate values
    const totalDeposit = activeData.reduce((acc, row) => acc + row.deposit, 0);
    const totalSend = activeData.reduce((acc, row) => acc + row.send, 0);
    const totalPaid = activeData.reduce((acc, row) => acc + row.paid, 0);
    const endingBalance = activeData.length > 0 ? activeData[0].balance : 0;

    // Formatting Helpers
    const formatDateShort = (isoString) => {
        const parts = isoString.split('-');
        if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
        return isoString;
    };

    const formatCurrency = (val) => {
        if (!val) return '0.00';
        // Match the specific string layout requested (e.g., 211 175,00)
        return val.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(/\u202f/g, ' '); 
    };

    // Chart Data Preparation - Chart needs to go forward chronologically left to right
    const chartData = useMemo(() => {
        return [...activeData].reverse().map(row => ({
            dateFormatted: formatDateShort(row.date),
            balance: row.balance || 0,
        }));
    }, [activeData]);

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white border border-neutral-100 p-3 rounded-lg shadow-lg">
                    <p className="text-[#1E293B] font-bold text-sm mb-1">{label}</p>
                    <p className="text-brand-600 font-bold text-[13px]">Rs. {formatCurrency(payload[0].value)}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-transparent mt-12 w-full animate-in fade-in duration-500">
            {/* ── HEADER ── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <div className="flex flex-col gap-1">
                    <h2 className="text-[22px] font-bold text-[#1E293B] flex items-center gap-2">
                        <FiActivity className="text-brand-500" /> Ledger History Explorer
                    </h2>
                    <p className="text-[13px] text-neutral-500 font-medium">Search, filter, and visualize historical ledger data across all platforms.</p>
                </div>

                <div className="flex items-center gap-2 bg-white p-1 rounded-[12px] border border-neutral-200 shadow-sm self-start md:self-auto">
                    {['Last 7 Days', '30 Days', 'All Time', 'Custom'].map(range => (
                        <button
                            key={range}
                            onClick={() => setRangeType(range)}
                            className={`px-3 py-1.5 rounded-[8px] text-[12px] font-bold transition-all ${
                                rangeType === range 
                                ? 'bg-white text-brand-600 shadow-sm border border-neutral-100 ring-1 ring-brand-100' 
                                : 'text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50'
                            }`}
                        >
                            {range}
                        </button>
                    ))}
                </div>
            </div>

            {/* Custom Range Picker */}
            {rangeType === 'Custom' && (
                <div className="flex items-center gap-3 mb-6 bg-white p-3 rounded-2xl w-max shadow-sm border border-neutral-200">
                    <div className="flex items-center gap-2 bg-neutral-50 px-4 py-2 rounded-xl focus-within:border-brand-500 transition-all">
                        <FiCalendar className="text-neutral-400" />
                        <input 
                            type="date" 
                            value={historyStartDate}
                            onChange={(e) => setHistoryStartDate(e.target.value)}
                            className="bg-transparent border-none text-sm font-bold text-neutral-700 outline-none w-full"
                        />
                    </div>
                    <span className="text-neutral-400 font-medium text-sm">to</span>
                    <div className="flex items-center gap-2 bg-neutral-50 px-4 py-2 rounded-xl focus-within:border-brand-500 transition-all">
                        <FiCalendar className="text-neutral-400" />
                        <input 
                            type="date" 
                            value={historyEndDate}
                            onChange={(e) => setHistoryEndDate(e.target.value)}
                            className="bg-transparent border-none text-sm font-bold text-neutral-700 outline-none w-full"
                            max={new Date().toISOString().split('T')[0]}
                        />
                    </div>
                </div>
            )}

            {/* ── WHITE CONTAINER CARD ── */}
            <div className="bg-white rounded-[20px] p-6 sm:p-8 border border-neutral-200 shadow-sm">
                
                {/* TABS */}
                <div className="flex overflow-x-auto no-scrollbar border-b border-neutral-200 mb-8 pb-1">
                    <div className="flex items-center gap-8 pl-2">
                        {tabs.map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`text-[14px] font-semibold tracking-wide whitespace-nowrap pb-4 border-b-2 transition-all relative ${
                                    activeTab === tab 
                                    ? 'border-brand-600 text-brand-600' 
                                    : 'border-transparent text-neutral-500 hover:text-neutral-800 hover:border-neutral-300'
                                }`}
                            >
                                {tab === 'Global Master' && <span className="mr-2 opacity-80 inline-block w-2.5 h-2.5 rounded-full bg-gradient-to-tr from-brand-400 to-indigo-500 shadow-sm"></span>}
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="h-40 flex items-center justify-center">
                        <div className="w-8 h-8 border-4 border-brand-100 border-t-brand-600 rounded-full animate-spin" />
                    </div>
                ) : (
                    <>
                        {/* SUMMARY CARDS */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="bg-neutral-50/70 p-6 rounded-[16px] border border-neutral-100 transition-all hover:shadow-sm">
                                <p className="text-[12px] text-neutral-500 font-semibold mb-2">Total Send</p>
                                <p className="text-[26px] font-black text-emerald-600">Rs. {formatCurrency(totalSend)}</p>
                            </div>
                            <div className="bg-neutral-50/70 p-6 rounded-[16px] border border-neutral-100 transition-all hover:shadow-sm">
                                <p className="text-[12px] text-neutral-500 font-semibold mb-2">Total Paid</p>
                                <p className="text-[26px] font-black text-rose-600">Rs. {formatCurrency(totalPaid)}</p>
                            </div>
                            <div className="bg-neutral-50/70 p-6 rounded-[16px] border border-neutral-100 transition-all hover:shadow-sm">
                                <p className="text-[12px] text-neutral-500 font-semibold mb-2">Total Deposit</p>
                                <p className="text-[26px] font-black text-[#1E293B]">Rs. {formatCurrency(totalDeposit)}</p>
                            </div>
                        </div>

                        {/* CHART SECTION */}
                        <div className="border border-neutral-100 rounded-[16px] p-6 mb-8 relative">
                            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-6 border-b border-dashed border-neutral-200 pb-2">BALANCE TREND</p>
                            
                            {chartData.length > 0 ? (
                                <div className="h-[200px] w-full mt-4 flex items-end">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3}/>
                                                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                                                </linearGradient>
                                            </defs>
                                            <XAxis 
                                                dataKey="dateFormatted" 
                                                axisLine={{ stroke: '#E5E7EB', strokeDasharray: '4 4' }} 
                                                tickLine={false} 
                                                tick={{ fill: '#9CA3AF', fontSize: 11, fontWeight: 500 }}
                                                dy={10}
                                            />
                                            <YAxis 
                                                tickFormatter={(val) => `Rs${val >= 1000 ? (val/1000).toFixed(1) + 'k' : val}`}
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#9CA3AF', fontSize: 10, fontWeight: 500 }}
                                            />
                                            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#E5E7EB', strokeWidth: 1, strokeDasharray: '4 4' }} />
                                            <Area 
                                                type="monotone" 
                                                dataKey="balance" 
                                                stroke="#3B82F6" 
                                                strokeWidth={2.5} 
                                                fillOpacity={1} 
                                                fill="url(#colorBalance)" 
                                            />
                                            {/* Horizontal zero line for context */}
                                            <line x1="0" y1="0" x2="100%" y2="0" style={{ stroke: '#E5E7EB', strokeWidth: 1, strokeDasharray: '4 4' }}/>
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="h-[160px] flex items-center justify-center text-sm font-medium text-neutral-400">
                                    Not enough data points available.
                                </div>
                            )}
                        </div>

                        {/* RECORDS TABLE */}
                        <div>
                            <div className="flex items-center justify-between mb-4 mt-2 px-2">
                                <h3 className="text-[14px] font-bold text-[#1E293B]">Detailed Records</h3>
                                <p className="text-[12px] text-neutral-400 font-medium">Showing {activeData.length} records</p>
                            </div>

                            <div className="overflow-x-auto rounded-[12px] border border-neutral-200">
                                <table className="w-full text-left border-collapse min-w-[700px]">
                                    <thead>
                                        <tr className="bg-neutral-50/50 border-b border-neutral-200">
                                            <th className="py-4 pl-6 pr-3 text-[11px] font-bold text-neutral-500 tracking-wider">DATE</th>
                                            <th className="py-4 px-3 text-[11px] font-bold text-neutral-500 tracking-wider">B/F</th>
                                            <th className="py-4 px-3 text-[11px] font-bold text-neutral-500 tracking-wider">SEND</th>
                                            <th className="py-4 px-3 text-[11px] font-bold text-neutral-500 tracking-wider">PAID</th>
                                            <th className="py-4 px-3 text-[11px] font-bold text-neutral-500 tracking-wider">DEPOSIT</th>
                                            <th className="py-4 pr-6 pl-3 text-[11px] font-bold text-neutral-900 tracking-wider text-right">BALANCE</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white">
                                        {activeData.map((row, idx) => (
                                            <tr key={idx} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50/30 transition-colors">
                                                <td className="py-3 pl-6 pr-3 text-[13px] font-semibold text-neutral-600">{formatDateShort(row.date)}</td>
                                                <td className="py-3 px-3 text-[13px] font-medium text-neutral-600">{formatCurrency(row.bf)}</td>
                                                <td className="py-3 px-3 text-[13px] font-medium text-neutral-600">{formatCurrency(row.send)}</td>
                                                <td className="py-3 px-3 text-[13px] font-medium text-neutral-600">{formatCurrency(row.paid)}</td>
                                                <td className="py-3 px-3 text-[13px] font-medium text-neutral-600">{row.deposit === 0 ? '-' : formatCurrency(row.deposit)}</td>
                                                <td className={`py-3 pr-6 pl-3 text-[13px] font-bold text-right ${row.balance < 0 ? 'text-rose-500' : 'text-[#1E293B]'}`}>
                                                    {formatCurrency(row.balance)}
                                                </td>
                                            </tr>
                                        ))}
                                        {activeData.length === 0 && (
                                            <tr>
                                                <td colSpan={6} className="py-12 text-center text-sm font-medium text-neutral-400">
                                                    No ledger entries exist for the selected period.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                    </>
                )}
            </div>
        </div>
    );
};

export default LedgerHistoryExplorer;
