import React, { useState, useEffect, useRef } from 'react';
import DailyDrawerReconciliation from '../../../components/dashboard/DailyDrawerReconciliation';
import CloseDayConfirmationModal from '../../../components/dashboard/CloseDayConfirmationModal';
import {
    Clock,
    ArrowUpRight,
    ArrowDownLeft,
    PlusCircle,
    Activity,
    RefreshCw,
    Lock,
    User,
    Shield,
    CheckCircle,
    Calendar,
    ExternalLink,
    AlertCircle,
    Pointer
} from 'lucide-react';
import { motion } from 'framer-motion';
import { getLedgerStatus, lockLedger, openLedger } from '../../../api/ledgerApi';
import PlatformBalanceTable from '../../../components/dashboard/PlatformBalanceTable';
import useSettings from '../../../hooks/useSettings';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyBalances } from '../../../redux/features/userBalance/userBalanceSlice';
import RevenueAnalyticsChart from '../../../components/dashboard/RevenueAnalyticsChart';
import { getTransactionStats } from '../../../api/transactionApi';
import LedgerHistoryExplorer from '../../../components/dashboard/LedgerHistoryExplorer';
import toast from 'react-hot-toast';

const UserDashboard = ({ userInfo }) => {
    const { loadActivePlatforms } = useSettings();
    const dispatch = useDispatch();
    const { balances: myBalances, loading: balancesLoading } = useSelector((state) => state.userBalance);
    const reconciliationRef = useRef(null);

    const [startLoading, setStartLoading] = useState(false);
    const [isCloseDayModalOpen, setIsCloseDayModalOpen] = useState(false);
    const [ledgerStatus, setLedgerStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalTransactions: 0,
        volume: 0,
        averageValue: 0,
        successRate: 0
    });

    useEffect(() => {
        checkLedgerStatus();
        dispatch(fetchMyBalances());
        fetchStats();
        loadActivePlatforms();
    }, [dispatch, loadActivePlatforms]);

    const checkLedgerStatus = async () => {
        try {
            const response = await getLedgerStatus();
            setLedgerStatus(response.data);
            if (!response.data?.isOpen) {
                // Temporarily disabling the mandatory daily shift pop-up based on user request
                // setIsOpeningModalOpen(true);
            }
        } catch (error) {
            console.error('Error checking ledger status:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await getTransactionStats();
            setStats(response.data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const handleStartDay = async () => {
        try {
            setStartLoading(true);
            const suggested = ledgerStatus?.suggestedOpening || 0;
            await openLedger({ openingBalance: suggested, currency: 'LKR' });
            toast.success('Day started successfully');
            await checkLedgerStatus();
            dispatch(fetchMyBalances());
        } catch (error) {
            console.error('Error starting day:', error);
            toast.error(error.response?.data?.message || 'Failed to start day');
        } finally {
            setStartLoading(false);
        }
    };

    const handleCloseDayConfirm = async () => {
        try {
            setLoading(true);
            await lockLedger({}); // Initiates shift locking without requiring billetage
            toast.success('Shift locked for reconciliation');
            await checkLedgerStatus(); // Refresh status to set isClosed to true
            scrollToReconciliation();
        } catch (error) {
            console.error('Error locking ledger:', error);
            toast.error(error.response?.data?.message || 'Failed to lock shift');
        } finally {
            setLoading(false);
        }
    };

    const scrollToReconciliation = () => {
        reconciliationRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
            </div>
        );
    }

    const isNotStarted = !ledgerStatus?.status;
    const isOpen = ledgerStatus?.status === 'open';
    const isClosed = ledgerStatus?.status === 'locked' || ledgerStatus?.status === 'closed' || isNotStarted;

    const globalTotals = myBalances.reduce((acc, platform) => ({
        opening: acc.opening + (platform.openingBalanceLkr || 0),
        send: acc.send + (platform.todaySendLkr || 0),
        paid: acc.paid + (platform.todayPaidLkr || 0),
        deposit: acc.deposit + (platform.todayDepositLkr || 0),
        balance: acc.balance + (platform.currentBalanceLkr || 0)
    }), { opening: 0, send: 0, paid: 0, deposit: 0, balance: 0 });

    return (
        <div className="p-4 lg:p-8 space-y-12">


            <CloseDayConfirmationModal
                isOpen={isCloseDayModalOpen}
                onClose={() => setIsCloseDayModalOpen(false)}
                onConfirm={handleCloseDayConfirm}
            />

            <div className="space-y-8">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                                Welcome back, <span className="text-brand-600">{userInfo?.email || 'Partner'}</span>
                            </h1>
                            {isNotStarted ? (
                                <div className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-sm border bg-slate-50 text-slate-400 border-slate-200">
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                                    Not Started
                                </div>
                            ) : isOpen ? (
                                <div className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-sm border bg-emerald-50 text-emerald-600 border-emerald-100">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    Opening
                                </div>
                            ) : (
                                <div className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-sm border bg-slate-100 text-slate-400 border-slate-200">
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                                    Closed
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => dispatch(fetchMyBalances())}
                                className="bg-white hover:bg-slate-50 text-slate-600 px-5 py-3 rounded-xl flex items-center gap-2 font-black text-[10px] tracking-widest transition-all border border-slate-200 active:scale-95 cursor-pointer shadow-sm"
                            >
                                <RefreshCw size={14} className={balancesLoading ? 'animate-spin' : ''} /> REFRESH
                            </button>
                            <button
                                onClick={handleStartDay}
                                disabled={!isNotStarted || startLoading}
                                className={`px-6 py-3 rounded-xl flex items-center gap-2 font-black text-[10px] tracking-widest transition-all shadow-xl active:scale-95 cursor-pointer ${isNotStarted ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200/50' : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none'}`}
                            >
                                {startLoading ? <RefreshCw size={14} className="animate-spin" /> : <PlusCircle size={14} />} START DAY
                            </button>
                            <button
                                onClick={() => setIsCloseDayModalOpen(true)}
                                disabled={!isOpen}
                                className={`px-6 py-3 rounded-xl flex items-center gap-2 font-medium text-[10px] transition-all shadow-xl active:scale-95 cursor-pointer ${isOpen ? 'bg-brand-600 hover:bg-brand-700 text-white shadow-brand-200/50' : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none'}`}
                            >
                                <Lock size={14} /> CLOSE DAY
                            </button>
                        </div>
                    </div>
                    <p className="text-slate-500 font-medium text-xs mt-1">Here's what's happening in your workspace today.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                    {/* Brought Fwd */}
                    <div className="bg-white rounded-2xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100 group hover:border-slate-200 transition-all relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-slate-50 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-125" />
                        <div className="relative z-10">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Brought Fwd</p>
                            <p className="text-[26px] font-black text-slate-950 tracking-tighter truncate">
                                {globalTotals.opening.toLocaleString()}
                            </p>
                        </div>
                    </div>

                    {/* Send */}
                    <div className="bg-white rounded-2xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100 group hover:border-emerald-100 transition-all relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-50 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-125" />
                        <div className="relative z-10">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Send</p>
                            <p className="text-[26px] font-black text-emerald-600 tracking-tighter truncate">
                                +{globalTotals.send.toLocaleString()}
                            </p>
                        </div>
                    </div>

                    {/* Paid */}
                    <div className="bg-white rounded-2xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100 group hover:border-indigo-100 transition-all relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-50 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-125" />
                        <div className="relative z-10">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Paid</p>
                            <p className="text-[26px] font-black text-indigo-600 tracking-tighter truncate">
                                -{globalTotals.paid.toLocaleString()}
                            </p>
                        </div>
                    </div>

                    {/* Deposit */}
                    <div className="bg-white rounded-2xl p-6 shadow-xl shadow-slate-200/50 border border-slate-100 group hover:border-emerald-100 transition-all relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-50 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-125" />
                        <div className="relative z-10">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Deposit</p>
                            <p className="text-[26px] font-black text-emerald-600 tracking-tighter truncate">
                                -{globalTotals.deposit.toLocaleString()}
                            </p>
                        </div>
                    </div>

                    {/* Net Balance (Highlighted) */}
                    <div className="bg-slate-900 rounded-2xl p-6 shadow-2xl relative overflow-hidden group/balance cursor-default transition-all hover:bg-slate-800 border border-slate-800">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-brand-500/20 blur-2xl rounded-full -mr-12 -mt-12 transition-all group-hover/balance:scale-150" />
                        <div className="relative z-10">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Net Balance</p>
                            <p className="text-[26px] font-black text-white tracking-tighter truncate">
                                {globalTotals.balance.toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            {/* ── Platform Ledgers ── */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <p className="text-sm text-neutral-500 font-medium">Manage your daily platform finances</p>
                        <Pointer size={16} className="text-brand-500 rotate-90" />
                    </div>
                </div>
                <PlatformBalanceTable platforms={myBalances} loading={balancesLoading} isClosed={isClosed} />
            </div>
            {/* 
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full min-h-[300px]">
                <div>
                    <RevenueAnalyticsChart 
                        data={[]} 
                        loading={false} 
                        stats={stats} 
                    />
                </div>
                <div className="flex flex-col gap-6">
                    <div className="bg-white rounded-3xl p-8 border border-neutral-100 shadow-xl flex-1 flex flex-col justify-center relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
                        <div className="relative z-10">
                            <h3 className="text-2xl font-bold text-neutral-900 mb-2">Shift Overview</h3>
                            <p className="text-neutral-500 mb-6 max-w-xs">Monitor your active shift performance and platform reconciliations.</p>
                            <div className="flex items-center gap-4">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Active Platforms</span>
                                    <span className="text-2xl font-black text-brand-600">{myBalances.length}</span>
                                </div>
                                <div className="w-px h-10 bg-neutral-100 mx-2" />
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Global Status</span>
                                    <span className="flex items-center gap-1.5 text-emerald-600 font-bold">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        Operational
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            */}

            <div className="mt-12" ref={reconciliationRef}>
                <DailyDrawerReconciliation 
                    isFinalized={ledgerStatus?.status === 'locked' || ledgerStatus?.status === 'closed'} 
                    isNotStarted={isNotStarted} 
                />
            </div>

            <div className="mt-12">
                <LedgerHistoryExplorer />
            </div>
        </div>
    );
};

export default UserDashboard;
