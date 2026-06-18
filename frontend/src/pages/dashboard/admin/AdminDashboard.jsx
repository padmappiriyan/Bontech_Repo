import { useState, useEffect, useRef } from 'react';
import { BarChart2, Zap, Users } from 'lucide-react';
import { getUserStats } from '../../../api/userApi';
import CircularRoleChart, { ChartLegend } from '../../../components/dashboard/CircularRoleChart';
import StatCircles from '../../../components/dashboard/StatCircles';
import AdminOverviewMetrics from '../../../components/dashboard/AdminOverviewMetrics';
// import PlatformDistributionChart from '../../../components/dashboard/admin/PlatformDistributionChart';
import AdminFilterPanel from '../../../components/dashboard/admin/AdminFilterPanel';
import UserLedgerTable from '../../../components/dashboard/admin/UserLedgerTable';
import { getGlobalPlatformBalances } from '../../../api/userBalanceApi';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllUsersBalances } from '../../../redux/features/userBalance/userBalanceSlice';
import useSettings from '../../../hooks/useSettings';

const AdminDashboard = ({ userInfo }) => {
    const dispatch = useDispatch();
    const { loadActivePlatforms, activePlatforms } = useSettings();
    const { allUsersBalances, allUsersLoading } = useSelector(state => state.userBalance);

    const [stats, setStats] = useState({ admin: 0, supervisor: 0, user: 0, total: 0 });
    const [globalBalances, setGlobalBalances] = useState(null);
    const [loading, setLoading] = useState(true);

    // Filter State
    const [filters, setFilters] = useState({
        name: '',
        email: '',
        role: 'all',
        status: 'all',
        broughtFwd: null,
        totalSend: null,
        totalPaid: null,
        totalDeposit: null,
        netBalance: null,
        lastUpdated: '',
        platformId: 'all',
        updatedFrom: '',
        updatedTo: ''
    });

    const isFirstRender = useRef(true);

    useEffect(() => {
        fetchInitialData();
        loadActivePlatforms();
        // Initial load
        applyFilters();
        isFirstRender.current = false;
    }, []);

    // Automatic filtering when dropdowns change
    useEffect(() => {
        if (isFirstRender.current) return;
        applyFilters(1);
    }, [filters.role, filters.status, filters.platformId, filters.updatedFrom, filters.updatedTo]);

    const fetchInitialData = async () => {
        try {
            const statsRes = await getUserStats();
            setStats(statsRes);

            const balanceRes = await getGlobalPlatformBalances();
            setGlobalBalances(balanceRes);
        } catch (error) {
            console.error('Failed to fetch initial admin data:', error);
        }
    };

    const applyFilters = (page = 1) => {
        console.log('[DEBUG] Applying filters:', filters);
        dispatch(fetchAllUsersBalances({ ...filters, page, size: 50 }));
    };

    const handlePageChange = (newPage) => {
        applyFilters(newPage);
    };

    const handleClearFilters = () => {
        const cleared = {
            name: '',
            email: '',
            role: 'all',
            status: 'all',
            broughtFwd: null,
            totalSend: null,
            totalPaid: null,
            totalDeposit: null,
            netBalance: null,
            lastUpdated: '',
            platformId: 'all',
            updatedFrom: '',
            updatedTo: ''
        };
        setFilters(cleared);
        dispatch(fetchAllUsersBalances({ ...cleared, page: 1, size: 50 }));
    };

    return (
        <div className="space-y-12 animate-in fade-in duration-700">
            {/* ── Page Header ── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                        Admin <span className="text-brand-600">Overview</span>
                    </h1>
                    <p className="text-slate-500 font-medium">Real-time system health and platform liquidity monitor</p>
                </div>

                <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-neutral-100">
                    <div className="flex items-center gap-3 px-4 py-2 bg-neutral-50 rounded-xl">
                        <Users size={18} className="text-brand-600" />
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest leading-none">Total Users</span>
                            <span className="text-sm font-black text-slate-900 leading-none mt-1">{stats.total}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Admin Overview Metrics ── */}
            {/* ── Section 1: Financial Intelligence & Core Metrics ── */}
            <section className="px-1">
                <AdminOverviewMetrics
                    totalUsers={stats.total}
                    data={globalBalances ? {
                        broughtFwd: globalBalances.totalOpeningBalance,
                        totalSend: globalBalances.totalSpend,
                        totalDeposit: globalBalances.totalDeposit,
                        totalPaid: globalBalances.totalPaid,
                        platformNet: globalBalances.totalCurrentBalance
                    } : {}}
                />
            </section>

            {/* ── Section 2: Platform Distribution Analytics (hidden for now) ── */}
            {/* <div className="px-1">
                <PlatformDistributionChart />
            </div> */}

            {/* ── Section 3: Filter System ── */}
            <section className="px-1">
                <AdminFilterPanel
                    filters={filters}
                    setFilters={setFilters}
                    onApply={() => applyFilters(1)}
                    onClear={handleClearFilters}
                    platforms={activePlatforms}
                />
            </section>

            {/* ── Individual User Ledgers ── */}
            <section className="px-1 mt-8">
                <UserLedgerTable
                    data={allUsersBalances}
                    loading={allUsersLoading}
                    pagination={useSelector(state => state.userBalance.allUsersPagination)}
                    onRefresh={() => applyFilters(1)}
                    onPageChange={handlePageChange}
                />
            </section>

            {/* ── New Minimal Stat Circles ── */}
            {/* <section className="p-10 mx-1">
                <StatCircles stats={stats} loading={loading} />
            </section> */}

            {/* ── Visual Insight Section ── */}
            {/* <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-12">
                <div className="lg:col-span-5 bg-white rounded-[3.5rem] border border-neutral-100 shadow-sm p-12 flex flex-col items-center justify-center min-h-[480px] group transition-all hover:shadow-lg">
                    <div className="w-full mb-10">
                        <h3 className="text-xl font-bold flex items-center gap-3 tracking-tight">
                            <BarChart2 size={24} className="text-brand-600" /> Infrastructure Balance
                        </h3>
                        <p className="text-neutral-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-1 italic">Normalized Role Ratios</p>
                    </div>

                    <CircularRoleChart stats={stats} loading={loading} />
                    <ChartLegend stats={stats} />
                </div>
            </div> */}
        </div>
    );
};

export default AdminDashboard;
