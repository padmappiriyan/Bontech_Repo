import { useState, useCallback } from 'react';
import { getAllUsers, createUser, updateUserStatus } from '../api/userApi';

const useUsers = () => {
    const [users, setUsers] = useState([]);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    /**
     * Fetch users with optional params
     */
    const fetchUsers = useCallback(async (params = {}) => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await getAllUsers(params);
            setUsers(data.users || []);
            setPagination(data.pagination);
        } catch (err) {
            setError(err.message || 'Failed to fetch users');
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Create a new user (Admin action)
     * @param {object} userData 
     */
    const handleCreateUser = async (userData) => {
        setIsLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const newUser = await createUser(userData);
            setSuccess(true);
            setUsers((prev) => [newUser, ...prev]); // Optimistic update
            return newUser;
        } catch (err) {
            setError(err.message || 'Failed to create user. Please check inputs.');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Toggle user status (Active/Inactive/Suspended/Deleted)
     */
    const handleToggleStatus = async (userId, newStatus) => {
        const originalUsers = [...users];
        
        // ── Optimistic Update ──
        if (newStatus === 'deleted') {
            setUsers(prev => prev.filter(u => (u.id || u._id) !== userId));
        } else {
            setUsers(prev => prev.map(u => (u.id || u._id) === userId ? { ...u, status: newStatus } : u));
        }
        
        setError(null);

        try {
            await updateUserStatus(userId, newStatus);
        } catch (err) {
            setUsers(originalUsers); // ── Revert ──
            setError(err.message || 'Failed to update account status');
            throw err;
        }
    };

    return { 
        users, 
        pagination,
        isLoading, 
        error, 
        success, 
        fetchUsers, 
        handleCreateUser,
        handleToggleStatus,
        setSuccess 
    };
};

export default useUsers;
