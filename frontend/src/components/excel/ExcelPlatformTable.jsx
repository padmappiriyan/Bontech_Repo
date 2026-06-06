import React, { useMemo } from 'react';
import { format } from 'date-fns';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { getPlatformStyle } from '../../utils/platformStyles';
import { formatCurrencyAmount } from '../../utils/currency';
import { parseAmount, computeBalance, getPlatformKey } from '../../utils/excelLedger';

const ExcelPlatformTable = ({ platform, rows, onRowChange, selectedMonth, onPrevMonth, onNextMonth }) => {
    const style = getPlatformStyle(platform.name, platform.slug);
    const Icon = style.icon;

    const totals = useMemo(
        () =>
            rows.reduce(
                (acc, row) => ({
                    send: acc.send + parseAmount(row.send),
                    paid: acc.paid + parseAmount(row.paid),
                    deposit: acc.deposit + parseAmount(row.deposit),
                }),
                { send: 0, paid: 0, deposit: 0 }
            ),
        [rows]
    );

    const handleChange = (dateKey, field, rawValue) => {
        const row = rows.find((item) => item.dateKey === dateKey);
        if (!row) return;

        const nextRow = { ...row, [field]: rawValue };
        nextRow.balance = computeBalance(nextRow.bf, nextRow.send, nextRow.paid, nextRow.deposit);
        onRowChange(getPlatformKey(platform), dateKey, nextRow);
    };

    return (
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden flex flex-col mb-4">
            <div className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg ${style.headerBg} ${style.headerText} flex items-center justify-center`}>
                        <Icon size={16} />
                    </div>
                    <h3 className="text-base font-black uppercase tracking-wide text-neutral-800">
                        {style.displayName}
                    </h3>
                </div>
                
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={onPrevMonth}
                        className="p-2 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 transition-colors"
                        aria-label="Previous month"
                    >
                        <FiChevronLeft size={16} />
                    </button>
                    <div className="px-4 py-2 rounded-xl border border-neutral-200 bg-white min-w-[140px] text-center">
                        <span className="text-sm font-black text-neutral-800 tracking-tight">
                            {format(selectedMonth, 'MMMM yyyy')}
                        </span>
                    </div>
                    <button
                        type="button"
                        onClick={onNextMonth}
                        className="p-2 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 transition-colors"
                        aria-label="Next month"
                    >
                        <FiChevronRight size={16} />
                    </button>
                </div>
            </div>

            <div className="overflow-auto max-h-[440px] custom-scrollbar">
                <table className="w-full text-sm table-fixed">
                    <thead className="sticky top-0 z-10 bg-white shadow-[0_1px_0_0_#f5f5f5]">
                        <tr className="text-[11px] font-black uppercase tracking-wider text-neutral-500">
                            <th className="px-6 py-4 text-left w-1/6">Date</th>
                            <th className="px-4 py-4 text-center w-1/6">B/F</th>
                            <th className="px-4 py-4 text-center w-1/6">Send</th>
                            <th className="px-4 py-4 text-center w-1/6">Paid</th>
                            <th className="px-4 py-4 text-center w-1/6">Deposit</th>
                            <th className="px-6 py-4 text-right w-1/6">Balance</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                        {rows.map((row) => (
                            <tr
                                key={row.dateKey}
                                className="bg-white hover:bg-neutral-50/50 transition-colors"
                            >
                                <td className="px-6 py-3 font-bold text-neutral-600 whitespace-nowrap">
                                    {format(row.date, 'dd/MM/yyyy')}
                                </td>
                                {['bf', 'send', 'paid', 'deposit'].map((field) => (
                                    <td key={field} className="px-4 py-2 text-center">
                                        <input
                                            type="text"
                                            inputMode="decimal"
                                            value={row[field] || ''}
                                            onChange={(e) => handleChange(row.dateKey, field, e.target.value)}
                                            className="w-full h-9 px-2 text-center rounded-lg border border-transparent bg-transparent hover:bg-neutral-50 focus:bg-white focus:border-brand-300 focus:ring-2 focus:ring-brand-100 outline-none font-semibold text-neutral-700 tabular-nums transition-all placeholder:text-neutral-300"
                                            placeholder="-"
                                        />
                                    </td>
                                ))}
                                <td className="px-6 py-3 text-right font-black text-neutral-900 tabular-nums">
                                    {formatCurrencyAmount(computeBalance(row.bf, row.send, row.paid, row.deposit))}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="border-t-2 border-neutral-200 bg-neutral-50/90 shrink-0">
                <table className="w-full text-sm table-fixed">
                    <tfoot>
                        <tr className="text-[11px] font-black uppercase tracking-wider text-neutral-700">
                            <td className="px-6 py-3.5 w-1/6 whitespace-nowrap">Total</td>
                            <td className="px-4 py-3.5 w-1/6 text-center text-neutral-300">—</td>
                            <td className="px-4 py-3.5 w-1/6 text-center tabular-nums text-emerald-700">
                                {formatCurrencyAmount(totals.send)}
                            </td>
                            <td className="px-4 py-3.5 w-1/6 text-center tabular-nums text-indigo-700">
                                {formatCurrencyAmount(totals.paid)}
                            </td>
                            <td className="px-4 py-3.5 w-1/6 text-center tabular-nums text-rose-700">
                                {formatCurrencyAmount(totals.deposit)}
                            </td>
                            <td className="px-6 py-3.5 w-1/6 text-right text-neutral-300">—</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
};

export default ExcelPlatformTable;
