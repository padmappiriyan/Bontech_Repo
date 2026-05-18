import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { changePassword } from '../api/authApi';
import { setCredentials } from '../redux/features/auth/authSlice';
import toast from 'react-hot-toast';

const useChangePassword = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    /**
     * Change password and update user state.
     * @param {{ currentPassword, newPassword }} payload 
     */
    const handleChangePassword = async (payload) => {
        setIsLoading(true);
        setError(null);
        setSuccess(false);

        try {
            await changePassword(payload);
            setSuccess(true);
            
            // Update the local user info in Redux state
            const raw = localStorage.getItem('userInfo');
            if (raw) {
                const updatedUser = { ...JSON.parse(raw), isPasswordResetRequired: false };
                dispatch(setCredentials(updatedUser));
            }
            toast.success('Identity vault updated! Your new password is now active.');
            
            // Wait a moment for success message and then redirect to dashboard
            setTimeout(() => {
                navigate('/dashboard');
            }, 2000);
        } catch (err) {
            const msg = err.message || 'Failed to update password. Please try again.';
            setError(msg);
            toast.error(msg);
        } finally {
            setIsLoading(false);
        }
    };

    return { handleChangePassword, isLoading, error, success };
};

export default useChangePassword;
