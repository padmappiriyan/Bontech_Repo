import axiosInstance from './axiosInstance';

/**
 * Fetch Audit Logs
 * @param {Object} params - pageNumber, pageSize, action, userId, startDate, endDate
 * @returns {Promise<Object>}
 */
export const getAuditLogs = async (params) => {
    const { data } = await axiosInstance.get('/audit-logs', { params });
    return data;
};
