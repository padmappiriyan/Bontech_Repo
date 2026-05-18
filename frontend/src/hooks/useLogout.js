/**
 * useLogout — custom hook that handles user logout.
 * 
 * Flow: Calls logout api (to clear cookies on server) -> 
 *       dispatches clearCredentials (to clear local state in Redux) ->
 *       navigates back to the Login page.
 */
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logoutUser } from '../api/authApi';
import { clearCredentials } from '../redux/features/auth/authSlice';
import toast from 'react-hot-toast';

const useLogout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // Clear cookies on the backend
      await logoutUser();
    } catch (err) {
      console.error('Error during logout:', err);
    } finally {
      // Always clear local Redux state and redirect, regardless of API status
      dispatch(clearCredentials());
      toast.success('Logged out successfully. Securely session terminated.');
      navigate('/login');
    }
  };

  return { handleLogout };
};

export default useLogout;
