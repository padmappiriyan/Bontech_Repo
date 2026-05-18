/**
 * Redux store configuration.
 * API calls are handled by Axios (see src/api/), NOT by RTK Query,
 * so only feature slices are registered here.
 */
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/auth/authSlice';
import transactionsReducer from './features/transactions/transactionSlice';
import changeRequestsReducer from './features/transactions/changeRequestSlice';
import settingsReducer from './features/settings/settingsSlice';
import userBalanceReducer from './features/userBalance/userBalanceSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    transactions: transactionsReducer,
    changeRequests: changeRequestsReducer,
    settings: settingsReducer,
    userBalance: userBalanceReducer,
  },
  devTools: import.meta.env.DEV,
});

export default store;
