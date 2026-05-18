import React, { useState, useEffect } from 'react';
import { FiClock } from 'react-icons/fi';
import { fetchReconciliationHistory } from '../../../api/ledgerApi';

const UserReconciliationHistory = ({ userId }) => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) return;
        
        const loadHistory = async () => {
            try {
                setLoading(true);
                const data = await fetchReconciliationHistory(userId);
                setHistory(data || []);
            } catch (error) {
                console.error("Failed to fetch user reconciliation history:", error);
            } finally {
                setLoading(false);
            }
        };

        loadHistory();
    }, [userId]);

    const formatCurrency = (val) => {
        if (!val) return '0.00';
        return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    return (
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden animate-in fade-in duration-500 mt-8 mb-8">
            <div className="p-6 border-b border-slate-50 bg-slate-50/30">
                <h3 className="font-black text-slate-800 flex items-center gap-2">
                    <FiClock className="text-brand-600" />
                    Past Reconciliation Records
                </h3>
            </div>
            
            <div className="overflow-x-auto">
                {loading ? (
                    <div className="p-12 flex flex-col items-center justify-center space-y-4">
                        <div className="w-8 h-8 border-4 border-brand-100 border-t-brand-600 rounded-full animate-spin" />
                        <p className="text-slate-400 font-medium text-xs">Loading records...</p>
                    </div>
                ) : (
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Amount</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Cash</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">C/B</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Deposit</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Credit</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Difference</th>
                            </tr>
                        </thead>
                        <tbody>
                            {history.map((row, idx) => {
                                const rowBalance = ((row.actualClosing || 0) + (row.depositAmount || 0) - (row.creditAmount || 0));
                                const totalTransactionNet = row.totalTransactionNet || 0;
                                const rowDiff = Math.abs(rowBalance - totalTransactionNet) > 0.01;

                                return (
                                    <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-bold text-slate-600">{new Date(row.date).toLocaleDateString('en-GB')}</td>
                                        <td className="px-6 py-4 text-sm font-bold text-slate-900">{formatCurrency(totalTransactionNet)}</td>
                                        <td className="px-6 py-4 text-sm font-medium text-slate-600">{formatCurrency(row.actualClosing)}</td>
                                        <td className="px-6 py-4 text-sm font-medium text-slate-600">{formatCurrency(row.cbAmount)}</td>
                                        <td className="px-6 py-4 text-sm font-medium text-emerald-600">-{formatCurrency(row.depositAmount)}</td>
                                        <td className="px-6 py-4 text-sm font-medium text-rose-600">-{formatCurrency(row.creditAmount)}</td>
                                        <td className={`px-6 py-4 text-sm font-black text-right ${rowDiff ? 'text-rose-500' : 'text-emerald-500'}`}>
                                            {formatCurrency(rowBalance - totalTransactionNet)}
                                        </td>
                                    </tr>
                                );
                            })}
                            {history.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400 font-medium">No history available for this user.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default UserReconciliationHistory;
