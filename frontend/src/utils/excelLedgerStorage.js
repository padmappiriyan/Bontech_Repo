import {
    eachDayOfInterval,
    endOfMonth,
    format,
    startOfMonth,
} from 'date-fns';
import {
    applyEntryToRow,
    normalizeEntryType,
    parseAmount,
} from './excelLedger';

const getStorageKey = () => {
    try {
        const rawUser = localStorage.getItem('userInfo');
        const user = rawUser ? JSON.parse(rawUser) : null;
        const userId = user?.email || user?._id || user?.id || 'guest';
        return `mttms_excel_ledger_v1_${userId}`;
    } catch {
        return 'mttms_excel_ledger_v1_guest';
    }
};

export const LEDGER_UPDATED_EVENT = 'excel-ledger-updated';

const buildEmptyRow = (date) => ({
    date,
    dateKey: format(date, 'yyyy-MM-dd'),
    bf: '',
    send: '',
    paid: '',
    deposit: '',
    balance: 0,
});

const buildMonthRows = (monthDate) => {
    const start = startOfMonth(monthDate);
    const end = endOfMonth(monthDate);
    return eachDayOfInterval({ start, end }).map(buildEmptyRow);
};

export const loadLedgerTableData = () => {
    try {
        const raw = localStorage.getItem(getStorageKey());
        return raw ? JSON.parse(raw) : {};
    } catch {
        return {};
    }
};

export const saveLedgerTableData = (tableData, { notify = true } = {}) => {
    localStorage.setItem(getStorageKey(), JSON.stringify(tableData));
    if (notify) {
        window.dispatchEvent(new Event(LEDGER_UPDATED_EVENT));
    }
};

const ensureMonthRowsInData = (data, platformKey, monthDate) => {
    const monthKey = format(monthDate, 'yyyy-MM');
    const existing = data[platformKey]?.[monthKey];
    if (existing) return existing;
    return buildMonthRows(monthDate);
};

export const applyLedgerEntry = (tableData, { platformKey, date, type, amount }) => {
    const entryDate = date instanceof Date ? date : new Date(`${date}T12:00:00`);
    const dateKey = format(entryDate, 'yyyy-MM-dd');
    const entryMonth = startOfMonth(entryDate);
    const monthKey = format(entryMonth, 'yyyy-MM');
    const ledgerType = normalizeEntryType(type);
    const numericAmount = parseAmount(amount);

    const monthRows = ensureMonthRowsInData(tableData, platformKey, entryMonth);
    const updatedRows = monthRows.map((row) =>
        row.dateKey === dateKey ? applyEntryToRow(row, ledgerType, numericAmount) : row
    );

    return {
        tableData: {
            ...tableData,
            [platformKey]: {
                ...(tableData[platformKey] || {}),
                [monthKey]: updatedRows,
            },
        },
        entryMonthKey: monthKey,
        dateKey,
        entryDate,
    };
};

export const appendLedgerEntry = (entry) => {
    const current = loadLedgerTableData();
    const { tableData } = applyLedgerEntry(current, entry);
    saveLedgerTableData(tableData);
    return tableData;
};

export { buildMonthRows, buildEmptyRow };
