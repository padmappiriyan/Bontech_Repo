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

const UserTransactionHistory = () => {
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
        // Fetch personal stats for the current range
        dispatch(fetchTransactionStats({ range: timeRange }));
    }, [dispatch, timeRange]);

    const handleExport = async () => {
        try {
            setIsExporting(true);
            const blob = await exportTransactions({ range: timeRange });
            const url = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `MY_Audit_${timeRange}.xlsx`);
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
                    
                    <div className="mt-8 bg-brand-50/50 rounded-[2rem] p-8 border border-brand-100 flex flex-col gap-4 shadow-sm group hover:bg-brand-50 transition-colors">
                        <div>
                            <p className="text-[10px] font-black text-brand-900 uppercase tracking-widest">Personal Ledger Node</p>
                            <p className="text-[9px] font-bold text-brand-600/60 uppercase tracking-[0.2em] mt-1 italic">Verified synchronization active</p>
                        </div>
                        <div className="text-[11px] font-medium text-brand-800 leading-relaxed italic opacity-80">
                            "Accuracy in personal ledger records ensures institutional data integrity. Every entry is a contribution to a transparent ecosystem."
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
                        isAdmin={false} 
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

export default UserTransactionHistory;

