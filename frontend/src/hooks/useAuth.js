/**
 * useAuth — encapsulates login side-effects.
 *
 * Flow:  loginUser(credentials)  →  dispatch(setCredentials(user))  →  navigate('/dashboard')
 *
 * The hook owns Redux and navigation concerns so LoginForm stays a pure UI component.
 */
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../api/authApi';
import { setCredentials } from '../redux/features/auth/authSlice';
import toast from 'react-hot-toast';

const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Authenticate a user and redirect to the dashboard on success.
   * @param {{ email: string, password: string }} credentials
   */
  const handleLogin = async (credentials) => {
    setIsLoading(true);
    setError(null);

    try {
      // loginUser already unwraps data.user — we receive the plain user profile
      const userInfo = await loginUser(credentials);
      dispatch(setCredentials(userInfo));

      // REDIRECTION LOGIC
      if (userInfo.isPasswordResetRequired) {
        navigate('/auth/change-password');
      } else {
        // Since we currently only have a single /dashboard route implemented in App.jsx
        // we redirect all roles to /dashboard for now.
        navigate('/dashboard');
      }
      toast.success(`Access granted! Welcome back, ${userInfo.name}.`);
    } catch (err) {
      const msg = err.message || 'Login failed. Please check your credentials.';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return { handleLogin, isLoading, error };
};

export default useAuth;
