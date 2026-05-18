import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getMyPlatformBalances, getAllUsersBalances } from '../../../api/userBalanceApi';

// Async thunk to fetch platform balances for the current staff member
export const fetchMyBalances = createAsyncThunk(
    'userBalance/fetchMyBalances',
    async (_, { rejectWithValue }) => {
        try {
            const data = await getMyPlatformBalances();
            return data;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch platform balances');
        }
    }
);

// Async thunk to fetch all users' balances (Admin Only)
export const fetchAllUsersBalances = createAsyncThunk(
    'userBalance/fetchAllUsersBalances',
    async (filters, { rejectWithValue }) => {
        try {
            const data = await getAllUsersBalances(filters);
            return data;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch all users balances');
        }
    }
);

const initialState = {
    balances: [],
    allUsersBalances: [],
    allUsersPagination: {
        totalRecords: 0,
        totalPages: 0,
        currentPage: 1,
        size: 10
    },
    loading: false,
    allUsersLoading: false,
    error: null,
    lastUpdated: null
};

const userBalanceSlice = createSlice({
    name: 'userBalance',
    initialState,
    reducers: {
        resetBalanceStatus: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchMyBalances.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchMyBalances.fulfilled, (state, action) => {
                state.loading = false;
                state.balances = action.payload;
                state.lastUpdated = new Date().toISOString();
            })
            .addCase(fetchMyBalances.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchAllUsersBalances.pending, (state) => {
                state.allUsersLoading = true;
                state.error = null;
            })
            .addCase(fetchAllUsersBalances.fulfilled, (state, action) => {
                state.allUsersLoading = false;
                state.allUsersBalances = action.payload.data;
                state.allUsersPagination = action.payload.pagination;
            })
            .addCase(fetchAllUsersBalances.rejected, (state, action) => {
                state.allUsersLoading = false;
                state.error = action.payload;
            });
    }
});

export const { resetBalanceStatus } = userBalanceSlice.actions;
export default userBalanceSlice.reducer;
