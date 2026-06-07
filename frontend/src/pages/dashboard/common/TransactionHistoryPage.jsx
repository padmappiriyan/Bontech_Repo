import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { FiClock, FiFileText } from 'react-icons/fi';
import { fetchTransactions } from '../../../redux/features/transactions/transactionSlice';
import { exportTransactions } from '../../../api/transactionApi';
import TransactionDetailModal from '../../../components/transactions/modals/TransactionDetailModal';
import SharedTransactionList from '../../../components/transactions/history/shared/SharedTransactionList';

const TransactionHistoryPage = () => {
    const dispatch = useDispatch();
    const { userInfo } = useSelector((state) => state.auth);
    const list = useSelector((state) => state.transactions.list);
    const listLoading = useSelector((state) => state.transactions.listLoading);

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
    }, [dispatch, timeRange]);

    const handleExport = async () => {
        try {
            setIsExporting(true);
            const blob = await exportTransactions({ range: timeRange });
            const url = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement('a');
            link.href = url;
            const prefix = userInfo?.role === 'admin' ? 'ADMIN' : (userInfo?.role === 'supervisor' ? 'SUP' : 'USER');
            link.setAttribute('download', `${prefix}_Audit_${timeRange}.xlsx`);
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
        <div className="px-4 py-2 md:px-8 mx-auto w-full">
            <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-black text-neutral-900 tracking-tighter leading-none">
                        Transaction <span className="text-brand-600">History</span>
                    </h1>
                    
                </div>
            </div>

            <main className="mt-8 animate-in fade-in duration-1000">
                <div className="bg-white rounded-[2rem] border border-neutral-100 shadow-sm p-2">
                    <SharedTransactionList 
                        transactions={list} 
                        loading={listLoading} 
                        timeRange={timeRange} 
                        setTimeRange={setTimeRange} 
                        onViewDetail={setSelectedTx} 
                        isAdmin={userInfo?.role === 'admin'} 
                        onExport={handleExport}
                        isExporting={isExporting}
                    />
                </div>
            </main>

            <AnimatePresence>
                {selectedTx && (
                    <TransactionDetailModal transaction={selectedTx} onClose={() => setSelectedTx(null)} />
                )}
            </AnimatePresence>
        </div>
    );
};

export default TransactionHistoryPage;
