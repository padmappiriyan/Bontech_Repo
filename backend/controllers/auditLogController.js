import asyncHandler from 'express-async-handler';
import { AuditLog } from '../models/auditLog.model.js';

/**
 * @desc    Get all audit logs with pagination
 * @route   GET /api/audit-logs
 * @access  Private (Admin/Supervisor Only)
 */
const getAuditLogs = asyncHandler(async (req, res) => {
    const pageSize = Number(req.query.pageSize) || 20;
    const page = Number(req.query.pageNumber) || 1;

    let query = {};
    const isAdminOrSupervisor = req.user.role === 'admin' || req.user.role === 'supervisor';

    // If not Admin or Supervisor, force-filter by their own userId
    if (!isAdminOrSupervisor) {
        query.userId = req.user._id;
    } else if (req.query.userId) {
        // Admins/Supervisors can optionally filter by another userId
        query.userId = req.query.userId;
    }

    // Filter by action if provided
    if (req.query.action) {
        query.action = req.query.action;
    }

    // Date range
    if (req.query.startDate && req.query.endDate) {
        query.timestamp = {
            $gte: new Date(req.query.startDate),
            $lte: new Date(req.query.endDate)
        };
    }

    const count = await AuditLog.countDocuments(query);
    const logs = await AuditLog.find(query)
        .populate('userId', 'name email role')
        .populate('transactionId', 'platform amount currency type status')
        .sort({ timestamp: -1 }) // newest first
        .skip(pageSize * (page - 1))
        .limit(pageSize);

    res.json({
        success: true,
        data: logs,
        page,
        pages: Math.ceil(count / pageSize),
        total: count
    });
});

export { getAuditLogs };
