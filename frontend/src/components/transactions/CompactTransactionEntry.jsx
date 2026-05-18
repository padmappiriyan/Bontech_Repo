import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import {
    FiCheckCircle, FiX, FiCheckSquare, FiInfo, FiLock, FiUser, FiZap, FiChevronDown
} from 'react-icons/fi';
import { recordTransaction, resetStatus as resetTransactionStatus } from '../../redux/features/transactions/transactionSlice';
import { fetchMyBalances } from '../../redux/features/userBalance/userBalanceSlice';
import useSettings from '../../hooks/useSettings';
import toast from 'react-hot-toast';

const CompactTransactionEntry = ({ onComplete, initialPlatform, isClosed }) => {
    const dispatch = useDispatch();
    const { loading, error, success } = useSelector((state) => state.transactions);
    const { globalRates, loadRates } = useSettings();

    const [formData, setFormData] = useState({
        platform: initialPlatform || '',
        type: 'send',
        senderName: '',
        receiverName: '',
        amount: '',
        currency: 'USD',
        exchangeRate: 1.0,
        fees: 0,
        remarks: ''
    });

    const [totalPayout, setTotalPayout] = useState(0);

    useEffect(() => {
        loadRates();
    }, [loadRates]);

    useEffect(() => {
        const amount = parseFloat(formData.amount) || 0;
        const rate = parseFloat(formData.exchangeRate) || 0;
        const fees = parseFloat(formData.fees) || 0;
        const total = (amount * rate) + fees;
        setTotalPayout(total.toFixed(2));
    }, [formData.amount, formData.exchangeRate, formData.fees]);

    useEffect(() => {
        if (globalRates.length > 0) {
            const config = globalRates.find(r => r.sourceCurrency === formData.currency);
            if (config) {
                setFormData(prev => ({ ...prev, exchangeRate: config.rate.toString() }));
            }
        }
    }, [formData.currency, globalRates]);

    // Stable callback handling to prevent timer resets on re-renders
    const onCompleteRef = useRef(onComplete);
    useEffect(() => {
        onCompleteRef.current = onComplete;
    }, [onComplete]);

    useEffect(() => {
        if (success) {
            toast.success('Transaction has been Created! and ' + "Ledger has been updated.");
            setTimeout(() => {
                dispatch(fetchMyBalances());
            }, 500);

            const timer = setTimeout(() => {
                if (onCompleteRef.current) onCompleteRef.current();
                dispatch(resetTransactionStatus());
            }, 1500);
            return () => clearTimeout(timer);
        }
        if (error) {
            toast.error(error);
        }
    }, [success, error, dispatch]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.platform) return;

        const data = {
            ...formData,
            amount: parseFloat(formData.amount),
            exchangeRate: parseFloat(formData.exchangeRate),
            fees: parseFloat(formData.fees)
        };
        dispatch(recordTransaction(data));
    };

    const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
    const currencies = [
        { code: 'USD', name: 'US Dollar' },
        { code: 'EUR', name: 'Euro' },
        { code: 'GBP', name: 'British Pound' },
        { code: 'ETB', name: 'Ethiopian Birr' },
    ];

    return (
        <div className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Transaction Type Toggle */}
                <div className="flex bg-neutral-100 p-1 rounded-xl border border-neutral-200/50">
                    {['send', 'receive', 'deposit'].map(t => (
                        <button
                            key={t}
                            type="button"
                            disabled={isClosed}
                            onClick={() => setFormData(p => ({ ...p, type: t }))}
                            className={`flex-1 py-2 px-3 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all duration-300 ${formData.type === t ? 'bg-white text-brand-600 shadow-sm border border-neutral-100' : 'text-neutral-400 hover:text-neutral-500'} ${isClosed ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {t === 'receive' ? 'Paid' : t}
                        </button>
                    ))}
                </div>

                {/* Main Inputs Group */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5 relative">
                        <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-tight ml-1">Currency</label>

                        {/* Custom Dropdown Trigger */}
                        <button
                            type="button"
                            disabled={isClosed}
                            onClick={() => setIsCurrencyOpen(!isCurrencyOpen)}
                            className={`w-full bg-neutral-50 border border-neutral-100 p-2.5 rounded-xl font-bold text-[10px] uppercase flex items-center justify-between hover:bg-white transition-all group ${isClosed ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <span className="text-neutral-900">{formData.currency}</span>
                            <FiChevronDown className={`text-neutral-300 transition-transform duration-300 ${isCurrencyOpen ? 'rotate-180' : ''}`} size={12} />
                        </button>

                        {/* Dropdown Menu */}
                        <AnimatePresence>
                            {isCurrencyOpen && (
                                <>
                                    {/* Backdrop to close */}
                                    <div className="fixed inset-0 z-40" onClick={() => setIsCurrencyOpen(false)} />

                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 5, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute top-full left-0 right-0 z-50 bg-white border border-neutral-100 rounded-2xl shadow-2xl overflow-hidden py-1"
                                    >
                                        {currencies.map((c) => (
                                            <button
                                                key={c.code}
                                                type="button"
                                                onClick={() => {
                                                    setFormData(prev => ({ ...prev, currency: c.code }));
                                                    setIsCurrencyOpen(false);
                                                }}
                                                className={`w-full text-left px-4 py-2 text-[10px] font-bold uppercase transition-colors flex items-center justify-between
                                                    ${formData.currency === c.code ? 'bg-brand-50 text-brand-600' : 'text-neutral-500 hover:bg-neutral-50'}
                                                `}
                                            >
                                                <span>{c.code} <span className="text-[8px] opacity-40 ml-1">{c.name}</span></span>
                                                {formData.currency === c.code && <div className="w-1.5 h-1.5 rounded-full bg-brand-500" />}
                                            </button>
                                        ))}
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-tight ml-1">Principal</label>
                        <input
                            type="number" name="amount" step="0.01" required value={formData.amount} onChange={handleChange}
                            placeholder="0.00"
                            disabled={isClosed}
                            className={`w-full bg-neutral-50 border border-neutral-100 p-2.5 rounded-xl font-bold text-xs outline-none focus:ring-1 focus:ring-brand-500/20 transition-all ${isClosed ? 'opacity-50 cursor-not-allowed' : ''}`}
                        />
                    </div>
                </div>

                <div className="space-y-3 p-3 bg-neutral-50/50 rounded-2xl border border-neutral-100/50">
                    {formData.type === 'send' && (
                        <div className="relative">
                            <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-300" size={14} />
                            <input
                                type="text" name="senderName" value={formData.senderName} onChange={handleChange}
                                placeholder="Sender Name"
                                disabled={isClosed}
                                className={`w-full bg-white border border-neutral-100 pl-9 pr-4 py-2.5 rounded-xl text-xs font-medium outline-none focus:border-brand-300 transition-all ${isClosed ? 'opacity-50 cursor-not-allowed' : ''}`}
                            />
                        </div>
                    )}
                    {formData.type === 'receive' && (
                        <div className="relative">
                            <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-300" size={14} />
                            <input
                                type="text" name="receiverName" value={formData.receiverName} onChange={handleChange}
                                placeholder="Receiver Name"
                                disabled={isClosed}
                                className={`w-full bg-white border border-neutral-100 pl-9 pr-4 py-2.5 rounded-xl text-xs font-medium outline-none focus:border-brand-300 transition-all ${isClosed ? 'opacity-50 cursor-not-allowed' : ''}`}
                            />
                        </div>
                    )}
                    {formData.type === 'deposit' && (
                        <div className="bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100 text-[10px] text-emerald-600 font-bold text-center">
                            Admin Platform Deposit (No Name Required)
                        </div>
                    )}
                    <div className="relative">
                        <FiInfo className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-300" size={14} />
                        <input
                            type="text" name="remarks" value={formData.remarks} onChange={handleChange}
                            placeholder="Add Remark / Note"
                            disabled={isClosed}
                            className={`w-full bg-white border border-neutral-100 pl-9 pr-4 py-2.5 rounded-xl text-xs font-medium outline-none focus:border-brand-300 transition-all ${isClosed ? 'opacity-50 cursor-not-allowed' : ''}`}
                        />
                    </div>
                </div>

                {/* Fees and Total */}
                <div className="flex items-center justify-between px-1">
                    <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-tight">Fees</span>
                        <div className="relative w-20">
                            <input
                                type="number" name="fees" step="0.01" value={formData.fees} onChange={handleChange}
                                disabled={isClosed}
                                className={`w-full bg-transparent border-b border-neutral-200 py-1 font-bold text-xs outline-none focus:border-brand-500 transition-all ${isClosed ? 'opacity-50 cursor-not-allowed' : ''}`}
                            />
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-tight">Payout (LKR)</span>
                        <p className="text-lg font-black text-brand-600 tracking-tighter">
                            {Number(totalPayout).toLocaleString()}
                        </p>
                    </div>
                </div>

                {/* Action Button */}
                <button
                    disabled={loading || success}
                    type="submit"
                    className={`
                        w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-bold uppercase text-xs text-white shadow-xl transition-all active:scale-[0.98] cursor-pointer
                        ${loading ? 'bg-neutral-800 cursor-wait' : success ? 'bg-emerald-500' : isClosed ? 'bg-slate-300 cursor-not-allowed' : 'bg-brand-600 hover:bg-brand-700 shadow-brand-600/20'}
                    `}
                >
                    {loading ? (
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : success ? (
                        <><FiCheckCircle size={18} /> Success</>
                    ) : isClosed ? (
                        <><FiLock size={18} /> Shift Closed</>
                    ) : (
                        <><FiZap size={18} /> Process Entry</>
                    )}
                </button>
            </form>

            {/* Inline Error */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="p-3 bg-rose-50 text-rose-600 rounded-xl text-[9px] font-bold uppercase tracking-widest flex items-center gap-2 border border-rose-100"
                    >
                        <FiInfo size={14} /> {error}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CompactTransactionEntry;
