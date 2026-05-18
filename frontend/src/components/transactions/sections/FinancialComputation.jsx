import React from 'react';
import { FiDollarSign, FiRepeat, FiLock } from 'react-icons/fi';

const FinancialComputation = ({
    currency, amount, exchangeRate, fees, totalPayout, onChange
}) => {
    return (
        <div className="bg-[#f2f4f6] rounded-[2rem] p-8  border border-neutral-100">
            <div className="flex items-center gap-3 text-brand-600 mb-10">

                <h3 className="text-lg font-bold">Financial Computation</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                <div className="space-y-3">
                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-tight block">Currency Unit</label>
                    <div className="relative">
                        <select
                            name="currency" value={currency} onChange={onChange}
                            className="w-full bg-white border border-neutral-100 p-4 pr-10 rounded-xl font-bold text-[11px] uppercase appearance-none cursor-pointer outline-none focus:bg-white transition-all shadow-sm text-neutral-900"
                        >
                            <option value="USD">USD - United States Dollar</option>
                            <option value="EUR">EUR - Eurozone Euro</option>
                            <option value="GBP">GBP - British Pound</option>
                            <option value="ETB">ETB - Ethiopian Birr</option>
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-300">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-tight block">Principal (Amount)</label>
                    <div className="relative">
                        <input
                            type="number" name="amount" step="0.01" required value={amount} onChange={onChange}
                            placeholder="0.00"
                            className="w-full bg-white border border-neutral-100 px-5 py-4 rounded-xl font-bold text-sm outline-none shadow-sm focus:bg-white transition-all text-neutral-900"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-neutral-300">VAL</span>
                    </div>
                </div>

                <div className="space-y-3 opacity-80">
                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-tight block flex items-center gap-2">
                        Exchange Multiplier
                        <FiLock className="text-brand-600" size={10} />
                    </label>
                    <div className="relative group">
                        <input
                            type="number"
                            name="exchangeRate"
                            step="0.0001"
                            required
                            disabled
                            value={exchangeRate}
                            placeholder="1.0000"
                            className="w-full bg-neutral-100/50 border border-neutral-100 px-5 py-4 rounded-xl font-bold text-sm outline-none cursor-not-allowed select-none text-brand-700"
                        />
                        <FiRepeat className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-300" size={14} />
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-tight block">Fee Component</label>
                    <div className="relative">
                        <input
                            type="number" name="fees" step="0.01" value={fees} onChange={onChange}
                            placeholder="0.00"
                            className="w-full bg-white border border-neutral-100 px-5 py-4 rounded-xl font-bold text-sm outline-none shadow-sm focus:bg-white transition-all text-neutral-900"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-lg font-bold text-neutral-200 leading-none">$</span>
                    </div>
                </div>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-10 py-10 border-t border-neutral-50">
                <div className="bg-[#e0e3e5] border border-amber-100 p-6 rounded-2xl flex items-center gap-5 max-w-xl group hover:shadow-lg hover:shadow-amber-500/5 transition-all">
                    <div className="bg-white p-3 rounded-xl shadow-sm text-amber-600 group-hover:scale-110 transition-transform">
                        <FiLock size={20} />
                    </div>
                    <p className="text-[10px] font-bold text-amber-900 leading-relaxed uppercase ">
                        Post-submission, this entry will be permanantly locked for institutional audit.
                    </p>
                </div>

                <div className="text-right">
                    <p className="text-[10px] font-black text-neutral-400 uppercase  mb-2 pr-1">TOTAL PAYOUT</p>
                    <div className="flex items-baseline justify-end gap-3 translate-x-1">
                        <span className="text-2xl font-black text-brand-600">Rs.</span>
                        <span className="text-3xl font-black text-brand-600 tracking-tighter tabular-nums underline decoration-[#00426d]/10 underline-offset-8">
                            {totalPayout}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FinancialComputation;
