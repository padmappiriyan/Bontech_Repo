import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { createTransaction, getTransactions, getLedgerTransactions, getTransactionById, getTransactionStats } from '../../../api/transactionApi';

/**
 * Thunks for handling async transaction operations
 */
export const fetchTransactions = createAsyncThunk(
  'transactions/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const response = await getLedgerTransactions(params);
      return response; // { data, total, pages, page }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchTransactionStats = createAsyncThunk(
  'transactions/fetchStats',
  async (params, { rejectWithValue }) => {
    try {
      const response = await getTransactionStats(params);
      return response; // { summary, breakdown }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const recordTransaction = createAsyncThunk(
  'transactions/create',
  async (transactionData, { rejectWithValue }) => {
    try {
      const response = await createTransaction(transactionData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchTransactionById = createAsyncThunk(
  'transactions/fetchOne',
  async (id, { rejectWithValue }) => {
    try {
      const response = await getTransactionById(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  list: [],
  meta: {
    total: 0,
    pages: 0,
    currentPage: 1,
  },
  stats: {
    summary: {
      totalVolume: 0,
      totalCount: 0,
      sendCount: 0,
      sendAmount: 0,
      receiveCount: 0,
      receiveAmount: 0
    },
    breakdown: []
  },
  currentTransaction: null,
  listLoading: false,
  statsLoading: false,
  loading: false, // General loading for single items or creation
  error: null,
  success: false,
};

const transactionSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    resetStatus: (state) => {
      state.success = false;
      state.error = null;
    },
    clearCurrentTransaction: (state) => {
      state.currentTransaction = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All (Ledger)
      .addCase(fetchTransactions.pending, (state) => {
        state.listLoading = true;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.listLoading = false;
        state.list = action.payload.data;
        state.meta = {
          total: action.payload.total,
          pages: action.payload.pages,
          currentPage: action.payload.page,
        };
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.listLoading = false;
        state.error = action.payload;
      })
      // Create
      .addCase(recordTransaction.pending, (state) => {
        state.loading = true;
        state.success = false;
      })
      .addCase(recordTransaction.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        // Prepend the new transaction to the list so UI updates instantly
        state.list.unshift(action.payload);
        state.meta.total += 1;
      })
      .addCase(recordTransaction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch One
      .addCase(fetchTransactionById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransactionById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTransaction = action.payload;
      })
      .addCase(fetchTransactionById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Stats
      .addCase(fetchTransactionStats.pending, (state) => {
        state.statsLoading = true;
      })
      .addCase(fetchTransactionStats.fulfilled, (state, action) => {
        state.statsLoading = false;
        state.stats = action.payload;
      })
      .addCase(fetchTransactionStats.rejected, (state, action) => {
        state.statsLoading = false;
        state.error = action.payload;
      });
  },
});

export const { resetStatus, clearCurrentTransaction } = transactionSlice.actions;

export default transactionSlice.reducer;
