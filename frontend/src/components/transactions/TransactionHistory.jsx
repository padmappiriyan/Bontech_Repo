import React from 'react';
import { useSelector } from 'react-redux';
import AdminTransactionHistory from './history/AdminTransactionHistory';
import SupervisorTransactionHistory from './history/SupervisorTransactionHistory';
import UserTransactionHistory from './history/UserTransactionHistory';

/**
 * @desc    Master Orchestrator for Transaction History
 *          Dispatches the correct sub-component based on the Authenticated User's Role.
 */
const TransactionHistory = () => {
    const { userInfo } = useSelector((state) => state.auth);

    if (!userInfo) return null;

    switch (userInfo.role) {
        case 'admin':
            return <AdminTransactionHistory />;
        case 'supervisor':
            return <SupervisorTransactionHistory />;
        default:
            return <UserTransactionHistory />;
    }
};

export default TransactionHistory;
