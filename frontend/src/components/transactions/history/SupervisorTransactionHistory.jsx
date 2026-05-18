import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { 
    FiDownload
} from 'react-icons/fi';
import { fetchTransactions, fetchTransactionStats } from '../../../redux/features/transactions/transactionSlice';
import { exportTransactions } from '../../../api/transactionApi';
import TransactionDetailModal from '../modals/TransactionDetailModal';
import SharedTransactionList from './shared/SharedTransactionList';
import TransactionSummaryCard from './shared/TransactionSummaryCard';
import QuickStatsGrid from './shared/QuickStatsGrid';

const SupervisorTransactionHistory = () => {
    const dispatch = useDispatch();
    const list = useSelector((state) => state.transactions.list);
    const stats = useSelector((state) => state.transactions.stats);
    const listLoading = useSelector((state) => state.transactions.listLoading);
    const statsLoading = useSelector((state) => state.transactions.statsLoading);

    // Synchronize UI loading feel
    const dashboardLoading = listLoading || statsLoading;
    
    const [selectedTx, setSelectedTx] = useState(null);
    const [timeRange, setTimeRange] = useState('all');
    const [isExporting, setIsExporting] = useState(false);

    useEffect(() => {
        const filters = {
            range: timeRange,
            pageNumber: 1,
            pageSize: 50
        };
        dispatch(fetchTransactions(filters));
        // Fetch supervised stats for the current range
        dispatch(fetchTransactionStats({ range: timeRange }));
    }, [dispatch, timeRange]);

    const handleExport = async () => {
        try {
            setIsExporting(true);
            const blob = await exportTransactions({ range: timeRange });
            const url = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `SUPERVISOR_Audit_${timeRange}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Export failed:', err);
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-1000">
            {/* Top Row: Quick Multi-Metric Analysis */}
            <QuickStatsGrid stats={stats} loading={dashboardLoading} />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Mid-Row Left: Activity Summary (Balance Matrix Style) */}
                <div className="lg:col-span-5">
                    <TransactionSummaryCard stats={stats} loading={dashboardLoading} />
                    
                    <div className="mt-8 bg-neutral-900 rounded-[2rem] p-8 border border-neutral-800 flex flex-col gap-4 shadow-xl group transition-all">
                        <div>
                            <p className="text-[10px] font-black text-brand-500 uppercase tracking-widest leading-none">Compliance Node</p>
                            <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-[0.2em] mt-2 italic opacity-50">Verified oversight active</p>
                        </div>
                        <div className="text-[11px] font-medium text-neutral-300 leading-relaxed italic opacity-80">
                            "Supervisor oversight is the cornerstone of institutional trust. Monitoring patterns, ensuring compliance, and maintaining the highest standard of financial integrity."
                        </div>
                    </div>
                </div>

                {/* Mid-Row Right: Transactions Ledger */}
                <div className="lg:col-span-7 flex flex-col">
                    <SharedTransactionList 
                        transactions={list} 
                        loading={dashboardLoading} 
                        timeRange={timeRange} 
                        setTimeRange={setTimeRange} 
                        onViewDetail={setSelectedTx} 
                        isAdmin={true} 
                        onExport={handleExport}
                        isExporting={isExporting}
                    />
                </div>
            </div>

            <AnimatePresence>
                {selectedTx && (
                    <TransactionDetailModal transaction={selectedTx} onClose={() => setSelectedTx(null)} />
                )}
            </AnimatePresence>
        </div>
    );
};

export default SupervisorTransactionHistory;

