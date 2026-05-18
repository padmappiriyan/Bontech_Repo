/**
 * Auth slice — manages the logged-in user's profile in Redux state.
 *
 * Token strategy: HttpOnly Cookie (managed entirely by the browser/server).
 * This slice only stores the user's display information (name, role, etc.)
 * so the UI can render it without extra API calls.
 *
 * localStorage is used to re-hydrate the state on page reload.
 * It holds NO sensitive token data — just the public user profile.
 */
import { createSlice } from '@reduxjs/toolkit';

const STORAGE_KEY = 'userInfo';

const loadUserFromStorage = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const initialState = {
  userInfo: loadUserFromStorage(),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /**
     * Called after a successful login response.
     * @param {object} action.payload - user profile from the server (no tokens)
     */
    setCredentials: (state, action) => {
      state.userInfo = action.payload;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(action.payload));
    },

    /**
     * Called after a successful logout response.
     * Clears Redux state and localStorage. Cookies are cleared by the server.
     */
    clearCredentials: (state) => {
      state.userInfo = null;
      localStorage.removeItem(STORAGE_KEY);
    },
  },
});

export const { setCredentials, clearCredentials } = authSlice.actions;

export default authSlice.reducer;
