import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { 
  createChangeRequest, 
  getChangeRequests, 
  getChangeRequestById,
  approveChangeRequest, 
  rejectChangeRequest,
  getChangeRequestAnalytics
} from '../../../api/changeRequestApi';

/**
 * Thunks for async Change Request operations
 */
export const fetchChangeRequestAnalytics = createAsyncThunk(
  'changeRequests/fetchAnalytics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getChangeRequestAnalytics();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch analytics');
    }
  }
);

export const fetchChangeRequestById = createAsyncThunk(
  'changeRequests/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await getChangeRequestById(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch change request details');
    }
  }
);
export const requestChange = createAsyncThunk(
  'changeRequests/create',
  async (requestData, { rejectWithValue }) => {
    try {
      const response = await createChangeRequest(requestData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to submit change request');
    }
  }
);

export const fetchChangeRequests = createAsyncThunk(
  'changeRequests/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const response = await getChangeRequests(params);
      return response; // { data, total, pages, page }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch change requests');
    }
  }
);

export const approveRequest = createAsyncThunk(
  'changeRequests/approve',
  async ({ id, adminRemarks }, { rejectWithValue }) => {
    try {
      const response = await approveChangeRequest(id, { adminRemarks });
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to approve change request');
    }
  }
);

export const rejectRequest = createAsyncThunk(
  'changeRequests/reject',
  async ({ id, adminRemarks }, { rejectWithValue }) => {
    try {
      const response = await rejectChangeRequest(id, { adminRemarks });
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to reject change request');
    }
  }
);

const initialState = {
  requests: [],
  currentRequest: null,
  meta: {
    total: 0,
    pages: 0,
    currentPage: 1,
  },
  loading: false,
  analyticsLoading: false,
  actionLoading: false, // For approve/reject buttons
  error: null,
  success: false,
  analytics: null,
};

const changeRequestSlice = createSlice({
  name: 'changeRequests',
  initialState,
  reducers: {
    resetChangeRequestStatus: (state) => {
      state.success = false;
      state.error = null;
    },
    clearChangeRequests: (state) => {
      state.requests = [];
      state.meta = initialState.meta;
    },
    clearCurrentRequest: (state) => {
      state.currentRequest = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch All
      .addCase(fetchChangeRequests.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchChangeRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.requests = action.payload.data;
        state.meta = {
          total: action.payload.total,
          pages: action.payload.pages,
          currentPage: action.payload.page,
        };
      })
      .addCase(fetchChangeRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch By ID
      .addCase(fetchChangeRequestById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChangeRequestById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentRequest = action.payload;
      })
      .addCase(fetchChangeRequestById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Analytics
      .addCase(fetchChangeRequestAnalytics.pending, (state) => {
        state.analyticsLoading = true;
      })
      .addCase(fetchChangeRequestAnalytics.fulfilled, (state, action) => {
        state.analyticsLoading = false;
        state.analytics = action.payload;
      })
      .addCase(fetchChangeRequestAnalytics.rejected, (state) => {
        state.analyticsLoading = false;
      })
      // Submit Request
      .addCase(requestChange.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(requestChange.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        // Prepend the new request
        state.requests.unshift(action.payload);
        state.meta.total += 1;
      })
      .addCase(requestChange.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Approve/Reject Actions
      .addMatcher(
        (action) => action.type.endsWith('/approve/pending') || action.type.endsWith('/reject/pending'),
        (state) => {
          state.actionLoading = true;
          state.success = false;
          state.error = null;
        }
      )
      .addMatcher(
        (action) => action.type.endsWith('/approve/fulfilled') || action.type.endsWith('/reject/fulfilled'),
        (state, action) => {
          state.actionLoading = false;
          state.success = true;
          
          // Update the current request if it's the one being processed
          if (state.currentRequest && (state.currentRequest.id === action.payload.id || state.currentRequest._id === action.payload._id)) {
            state.currentRequest = action.payload;
          }

          // Update in the list if present
          const index = state.requests.findIndex(r => (r.id === action.payload.id || r._id === action.payload._id));
          if (index !== -1) {
            state.requests[index] = action.payload;
          }
        }
      )
      .addMatcher(
        (action) => action.type.endsWith('/approve/rejected') || action.type.endsWith('/reject/rejected'),
        (state, action) => {
          state.actionLoading = false;
          state.error = action.payload;
        }
      );
  },
});

export const { resetChangeRequestStatus, clearChangeRequests, clearCurrentRequest } = changeRequestSlice.actions;

export default changeRequestSlice.reducer;
