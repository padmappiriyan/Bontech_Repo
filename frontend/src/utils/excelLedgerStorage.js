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

/**
 * Load ledger table data for a SPECIFIC user (used by admin to view other users' records).
 * @param {{ email?: string, _id?: string, id?: string }} user
 */
export const loadLedgerTableDataForUser = (user) => {
    try {
        const userId = user?.email || user?._id || user?.id || 'guest';
        const key = `mttms_excel_ledger_v1_${userId}`;
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : {};
    } catch {
        return {};
    }
};

/**
 * Load and aggregate ledger table data for ALL active users.
 */
export const loadLedgerTableDataForAllUsers = (users) => {
    const aggregatedData = {};

    users.forEach(user => {
        // Only include active users in the aggregation
        if (user.status === 'inactive') return;

        const userData = loadLedgerTableDataForUser(user);
        
        Object.keys(userData).forEach(platformKey => {
            if (!aggregatedData[platformKey]) {
                aggregatedData[platformKey] = {};
            }
            
            Object.keys(userData[platformKey]).forEach(monthKey => {
                if (!aggregatedData[platformKey][monthKey]) {
                    const [year, month] = monthKey.split('-');
                    const monthDate = new Date(year, month - 1, 1);
                    aggregatedData[platformKey][monthKey] = buildMonthRows(monthDate);
                }
                
                const userMonthRows = userData[platformKey][monthKey];
                const aggMonthRows = aggregatedData[platformKey][monthKey];
                
                userMonthRows.forEach(userRow => {
                    const aggRowIndex = aggMonthRows.findIndex(r => r.dateKey === userRow.dateKey);
                    if (aggRowIndex !== -1) {
                        const aggRow = { ...aggMonthRows[aggRowIndex] };
                        
                        const currentBf = parseAmount(aggRow.bf);
                        const userBf = parseAmount(userRow.bf);
                        if (currentBf > 0 || userBf > 0) aggRow.bf = String(currentBf + userBf);

                        const currentSend = parseAmount(aggRow.send);
                        const userSend = parseAmount(userRow.send);
                        if (currentSend > 0 || userSend > 0) aggRow.send = String(currentSend + userSend);
                        
                        const currentPaid = parseAmount(aggRow.paid);
                        const userPaid = parseAmount(userRow.paid);
                        if (currentPaid > 0 || userPaid > 0) aggRow.paid = String(currentPaid + userPaid);
                        
                        const currentDeposit = parseAmount(aggRow.deposit);
                        const userDeposit = parseAmount(userRow.deposit);
                        if (currentDeposit > 0 || userDeposit > 0) aggRow.deposit = String(currentDeposit + userDeposit);
                        
                        aggRow.balance = parseAmount(aggRow.bf) + parseAmount(aggRow.send) - parseAmount(aggRow.paid) - parseAmount(aggRow.deposit);
                        
                        aggMonthRows[aggRowIndex] = aggRow;
                    }
                });
            });
        });
    });

    return aggregatedData;
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
