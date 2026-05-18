import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as settingsApi from '../../../api/settingsApi';

// THUNKS FOR PLATFORMS
export const fetchActivePlatforms = createAsyncThunk(
  'settings/fetchActivePlatforms',
  async (_, { rejectWithValue }) => {
    try {
      const response = await settingsApi.getActivePlatforms();
      return response.platforms;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch active sources');
    }
  }
);

export const fetchAllPlatforms = createAsyncThunk(
  'settings/fetchAllPlatforms',
  async (_, { rejectWithValue }) => {
    try {
      const response = await settingsApi.getAllPlatforms();
      return response.platforms;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch platforms');
    }
  }
);

export const addNewPlatform = createAsyncThunk(
  'settings/addPlatform',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await settingsApi.createPlatform(formData);
      return response.platform;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create platform');
    }
  }
);

export const modifyPlatform = createAsyncThunk(
  'settings/modifyPlatform',
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const response = await settingsApi.updatePlatform(id, formData);
      return response.platform;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update platform');
    }
  }
);

export const removePlatform = createAsyncThunk(
  'settings/removePlatform',
  async (id, { rejectWithValue }) => {
    try {
      await settingsApi.deletePlatform(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete platform');
    }
  }
);

// THUNKS FOR RATES
export const fetchGlobalRates = createAsyncThunk(
  'settings/fetchRates',
  async (_, { rejectWithValue }) => {
    try {
      const response = await settingsApi.getGlobalRates();
      return response.rates;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch currency rates');
    }
  }
);

export const updateGlobalRate = createAsyncThunk(
  'settings/updateRate',
  async (rateData, { rejectWithValue }) => {
    try {
      const response = await settingsApi.upsertGlobalRate(rateData);
      return response.rate;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update global rate');
    }
  }
);

export const syncGlobalRates = createAsyncThunk(
  'settings/syncRates',
  async (_, { rejectWithValue }) => {
    try {
      const response = await settingsApi.syncRatesWithExternal();
      return response.rates;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to synchronize live rates');
    }
  }
);

const initialState = {
  activePlatforms: [],
  allPlatforms: [],
  globalRates: [],
  loading: false,
  error: null,
  success: false,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    resetSettingsStatus: (state) => {
      state.success = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // PLATFORMS
      .addCase(fetchActivePlatforms.fulfilled, (state, action) => {
        state.loading = false;
        state.activePlatforms = action.payload;
      })
      .addCase(fetchAllPlatforms.fulfilled, (state, action) => {
        state.loading = false;
        state.allPlatforms = action.payload;
      })
      .addCase(addNewPlatform.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.allPlatforms.push(action.payload);
      })
      .addCase(modifyPlatform.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        const index = state.allPlatforms.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.allPlatforms[index] = action.payload;
        }
      })
      .addCase(removePlatform.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.allPlatforms = state.allPlatforms.filter(p => p.id !== action.payload);
      })
      // RATES
      .addCase(fetchGlobalRates.fulfilled, (state, action) => {
        state.loading = false;
        state.globalRates = action.payload;
      })
      .addCase(updateGlobalRate.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        const index = state.globalRates.findIndex(r => r.sourceCurrency === action.payload.sourceCurrency);
        if (index !== -1) {
          state.globalRates[index] = action.payload;
        } else {
          state.globalRates.push(action.payload);
        }
      })
      .addCase(syncGlobalRates.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.globalRates = action.payload;
      })
      // Unified Loading State
      .addMatcher(
        (action) => action.type.startsWith('settings/') && action.type.endsWith('/pending'),
        (state) => { state.loading = true; state.success = false; state.error = null; }
      )
      // Unified Error Handling
      .addMatcher(
        (action) => action.type.startsWith('settings/') && action.type.endsWith('/rejected'),
        (state, action) => { state.loading = false; state.error = action.payload; }
      );
  },
});

export const { resetSettingsStatus } = settingsSlice.actions;
export default settingsSlice.reducer;
