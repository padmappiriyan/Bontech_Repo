import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AnimatePresence } from 'framer-motion';
import {
    FiInfo, FiActivity, FiFileText, FiMessageSquare, FiAlertCircle
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';

import {
    fetchChangeRequestById,
    approveRequest,
    rejectRequest,
    clearCurrentRequest,
    resetChangeRequestStatus
} from '../../../redux/features/transactions/changeRequestSlice';

// Sub-components
import ReviewHeader from '../../../components/admin/change-request/ReviewHeader';
import ReviewTabs from '../../../components/admin/change-request/ReviewTabs';
import OverviewTab from '../../../components/admin/change-request/OverviewTab';
import ActionItemsTab from '../../../components/admin/change-request/ActionItemsTab';
import AuditTrailTab from '../../../components/admin/change-request/AuditTrailTab';
//import ReviewSidebar from '../../../components/admin/change-request/ReviewSidebar';
import ReviewTabPlaceholder from '../../../components/admin/change-request/ReviewTabPlaceholder';
import ActivityTimeline from '../../../components/admin/change-request/ActivityTimeline';

const TABS = [
    { id: 'overview', label: 'OVERVIEW', icon: <FiInfo size={14} /> },
    { id: 'action', label: 'ACTION ITEMS', icon: <FiAlertCircle size={14} /> },
    { id: 'documents', label: 'DOCUMENTS', icon: <FiFileText size={14} /> },
    { id: 'communications', label: 'COMMUNICATIONS', icon: <FiMessageSquare size={14} /> },
    { id: 'audit', label: 'AUDIT TRAIL', icon: <FiActivity size={14} /> },
];

const AdminChangeRequestReviewPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [activeTab, setActiveTab] = useState('overview');
    const [remarks, setRemarks] = useState('');

    const { userInfo } = useSelector((state) => state.auth);
    const { currentRequest: request, loading, actionLoading, success, error } = useSelector((state) => state.changeRequests);
    const isAdmin = userInfo?.role === 'admin' || userInfo?.role === 'supervisor';

    useEffect(() => {
        if (id) {
            dispatch(fetchChangeRequestById(id));
        }
        return () => {
            dispatch(clearCurrentRequest());
        };
    }, [id, dispatch]);

    useEffect(() => {
        if (success && !loading) {
            toast.success('Request processed successfully');
            dispatch(resetChangeRequestStatus());
            navigate('/dashboard/change-requests');
        }
        if (error) {
            toast.error(error);
            dispatch(resetChangeRequestStatus());
        }
    }, [success, error, loading, navigate, dispatch]);

    const handleApprove = () => dispatch(approveRequest({ id, adminRemarks: remarks }));

    const handleReject = () => {
        if (!remarks) {
            toast.error('Please provide remarks for rejection');
            return;
        }
        dispatch(rejectRequest({ id, adminRemarks: remarks }));
    };

    if (loading || !request) {
        return (
            <div className="flex items-center justify-center bg-slate-50/50">
                <div className="flex flex-col items-center gap-4 animate-pulse">
                    <div className="w-12 h-12 bg-brand-100 rounded-full flex items-center justify-center">
                        <FiActivity className="text-brand-600 animate-spin" />
                    </div>
                    <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Synchronizing Audit Data...</span>
                </div>
            </div>
        );
    }

    const transaction = request.transactionId;

    return (
        <div className=" bg-[#F8FAFC] p-6 lg:p-10 flex flex-col gap-8">
            <ReviewHeader
                transaction={transaction}
                request={request}
                navigate={navigate}
            />

            <ReviewTabs
                tabs={TABS}
                activeTab={activeTab}
                onTabChange={setActiveTab}
            />

            <div className={`grid gap-8 items-stretch ${activeTab === 'overview' ? 'grid-cols-1 lg:grid-cols-[1fr_340px]' : 'grid-cols-1'}`}>
                <AnimatePresence mode="wait">
                    <div key={activeTab} className="flex flex-col">
                        {activeTab === 'overview' && (
                            <OverviewTab request={request} transaction={transaction} />
                        )}

                        {activeTab === 'action' && (
                            <ActionItemsTab
                                request={request}
                                transaction={transaction}
                                remarks={remarks}
                                onRemarksChange={setRemarks}
                                onApprove={handleApprove}
                                onReject={handleReject}
                                actionLoading={actionLoading}
                            />
                        )}

                        {activeTab === 'audit' && (
                            <AuditTrailTab request={request} transaction={transaction} />
                        )}

                        {activeTab === 'documents' && (
                            <ReviewTabPlaceholder
                                icon={<FiFileText size={48} className="text-slate-300" />}
                                title="No attached documents"
                                description="Supporting documentation has not been uploaded for this amendment request."
                            />
                        )}

                        {activeTab === 'communications' && (
                            <ReviewTabPlaceholder
                                icon={<FiMessageSquare size={48} className="text-slate-300" />}
                                title="External COMMS Offline"
                                description="Communication log is only available for active processing sessions."
                            />
                        )}
                    </div>
                </AnimatePresence>

                {activeTab === 'overview' && (
                    <ActivityTimeline request={request} transaction={transaction} />
                )}
            </div>
        </div>
    );
};

export default AdminChangeRequestReviewPage;
