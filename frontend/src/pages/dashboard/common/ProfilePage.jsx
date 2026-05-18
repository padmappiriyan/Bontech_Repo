import { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    FiUser, FiShield, FiActivity, FiMail, FiCheckCircle,
    FiAlertCircle, FiEdit3, FiRefreshCw, FiClock, FiPhone, FiMapPin, FiBriefcase, FiLock, FiMoreHorizontal, FiCalendar, FiGlobe
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { getMyActivities } from '../../../api/activityApi';
import axiosInstance from '../../../api/axiosInstance';
import { setCredentials } from '../../../redux/features/auth/authSlice';

const ProfilePage = () => {
    const { userInfo } = useSelector((state) => state.auth);
    const dispatch = useDispatch();

    // UI State
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(userInfo?.name || '');
    const [phoneNumber, setPhoneNumber] = useState(userInfo?.phoneNumber || '');
    const [address, setAddress] = useState(userInfo?.address || '');
    const [dob, setDob] = useState(userInfo?.dob ? userInfo.dob.split('T')[0] : '');
    const [nationalId, setNationalId] = useState(userInfo?.nationalId || '');

    const [updateLoading, setUpdateLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', content: '' });

    // Activity State
    const [activities, setActivities] = useState([]);
    const [actLoading, setActLoading] = useState(false);

    // --- FETCH MY ACTIVITY ---
    const fetchMyActivities = useCallback(async () => {
        setActLoading(true);
        try {
            const res = await getMyActivities({ limit: 10 });
            setActivities(res.data || []);
        } catch (error) {
            console.error('Failed to load personal timeline', error);
        } finally {
            setActLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMyActivities();
    }, [fetchMyActivities]);

    // --- UPDATE PROFILE ---
    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setUpdateLoading(true);
        try {
            const { data } = await axiosInstance.put('/users/profile', {
                name,
                phoneNumber,
                address,
                dob,
                nationalId
            });
            if (data.success) {
                const updatedUser = {
                    ...userInfo,
                    name: data.user.name,
                    phoneNumber: data.user.phoneNumber,
                    address: data.user.address,
                    dob: data.user.dob,
                    nationalId: data.user.nationalId
                };
                dispatch(setCredentials(updatedUser));
                localStorage.setItem('userInfo', JSON.stringify(updatedUser));
                setMessage({ type: 'success', content: 'Profile updated successfully' });
                setIsEditing(false);
                setTimeout(() => setMessage({ type: '', content: '' }), 3000);
            }
        } catch (error) {
            setMessage({ type: 'error', content: error.response?.data?.message || 'Update failed' });
        } finally {
            setUpdateLoading(false);
        }
    };

    const getInitial = (name) => name ? name.charAt(0).toUpperCase() : '?';

    // Format Date for Display
    const formatDate = (dateString) => {
        if (!dateString) return 'Not provided';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: '2-digit'
        });
    };

    return (
        <div className="animate-in fade-in duration-700 px-4 md:px-0 pb-6">

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                {/* ── Left Column: User Profile Layout ── */}
                <div className="lg:col-span-7 bg-white p-6 md:p-8 rounded-3xl border border-neutral-100 shadow-sm">
                    
                    {/* Header: Avatar, Name, ID, Menu */}
                    <header className="flex items-start justify-between mb-8 pb-6 border-b border-neutral-50">
                        <div className="flex items-center gap-5">
                            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-brand-500 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-orange-100 shrink-0">
                                {getInitial(userInfo?.name)}
                            </div>
                            <div>
                                <h2 className="text-xl md:text-2xl font-bold text-neutral-900 leading-tight">{userInfo?.name}</h2>
                                <p className="text-neutral-400 text-xs font-bold mt-1 tracking-tight">ID: #{userInfo?.id?.slice(-8).toUpperCase()}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => setIsEditing(!isEditing)}
                                className={`p-2.5 rounded-xl transition-all ${isEditing ? 'bg-brand-600 text-white shadow-lg' : 'text-neutral-400 hover:text-brand-600 hover:bg-brand-50'}`}
                                title="Edit Profile"
                            >
                                <FiEdit3 size={18} />
                            </button>
                            <button className="p-2.5 text-neutral-400 hover:text-black hover:bg-neutral-50 rounded-xl transition-all">
                                <FiMoreHorizontal size={22} />
                            </button>
                        </div>
                    </header>

                    {message.content && (
                        <div className={`mb-6 p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                            {message.type === 'success' ? <FiCheckCircle /> : <FiAlertCircle />}
                            {message.content}
                        </div>
                    )}

                    <form onSubmit={handleUpdateProfile} className="space-y-8">
                        
                        {/* About Section */}
                        <section className="space-y-4">
                            <h3 className="text-sm font-black uppercase tracking-widest text-neutral-400">About</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex items-center gap-3 group">
                                    <div className="w-8 h-8 rounded-lg bg-neutral-50 flex items-center justify-center text-neutral-400 group-hover:text-brand-600 transition-colors">
                                        <FiPhone size={16} />
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-tighter">Phone</label>
                                        {isEditing ? (
                                            <input 
                                                type="tel" 
                                                value={phoneNumber}
                                                onChange={(e) => setPhoneNumber(e.target.value)}
                                                className="text-sm font-bold text-black border-b border-neutral-100 outline-none focus:border-brand-600 w-full bg-transparent"
                                            />
                                        ) : (
                                            <p className="text-sm font-bold text-black">{phoneNumber || 'Not provided'}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 group">
                                    <div className="w-8 h-8 rounded-lg bg-neutral-50 flex items-center justify-center text-neutral-400 group-hover:text-brand-600 transition-colors">
                                        <FiMail size={16} />
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-tighter">Email</label>
                                        <p className="text-sm font-bold text-black">{userInfo?.email}</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <div className="h-px bg-neutral-50 w-full" />

                        {/* Address Section */}
                        <section className="space-y-4">
                            <h3 className="text-sm font-black uppercase tracking-widest text-neutral-400">Address</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex items-center gap-3 group">
                                    <div className="w-8 h-8 rounded-lg bg-neutral-50 flex items-center justify-center text-neutral-400 group-hover:text-brand-600 transition-colors">
                                        <FiMapPin size={16} />
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-tighter">Address</label>
                                        {isEditing ? (
                                            <input 
                                                type="text" 
                                                value={address}
                                                onChange={(e) => setAddress(e.target.value)}
                                                className="text-sm font-bold text-black border-b border-neutral-100 outline-none focus:border-brand-600 w-full bg-transparent"
                                            />
                                        ) : (
                                            <p className="text-sm font-bold text-black">{address || 'Not provided'}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 group">
                                    <div className="w-8 h-8 rounded-lg bg-neutral-50 flex items-center justify-center text-neutral-400 group-hover:text-brand-600 transition-colors">
                                        <FiGlobe size={16} />
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-tighter">City/State</label>
                                        <p className="text-sm font-bold text-black">Srilanka, Jaffna (Primary)</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <div className="h-px bg-neutral-50 w-full" />

                        {/* Employee Details Section */}
                        <section className="space-y-4">
                            <h3 className="text-sm font-black uppercase tracking-widest text-neutral-400">Employee details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-5">
                                <div className="flex items-center gap-3 group">
                                    <div className="w-8 h-8 rounded-lg bg-neutral-50 flex items-center justify-center text-neutral-400 group-hover:text-brand-600 transition-colors">
                                        <FiCalendar size={16} />
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-tighter">Date of birth</label>
                                        {isEditing ? (
                                            <input 
                                                type="date" 
                                                value={dob}
                                                onChange={(e) => setDob(e.target.value)}
                                                className="text-sm font-bold text-black border-b border-neutral-100 outline-none focus:border-brand-600 bg-transparent"
                                            />
                                        ) : (
                                            <p className="text-sm font-bold text-black">{formatDate(userInfo?.dob)}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 group">
                                    <div className="w-8 h-8 rounded-lg bg-neutral-50 flex items-center justify-center text-neutral-400 group-hover:text-brand-600 transition-colors">
                                        <FiShield size={16} />
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-tighter">National ID</label>
                                        {isEditing ? (
                                            <input 
                                                type="text" 
                                                value={nationalId}
                                                onChange={(e) => setNationalId(e.target.value)}
                                                className="text-sm font-bold text-black border-b border-neutral-100 outline-none focus:border-brand-600 bg-transparent"
                                            />
                                        ) : (
                                            <p className="text-sm font-bold text-black">{nationalId || '---'}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 group">
                                    <div className="w-8 h-8 rounded-lg bg-neutral-50 flex items-center justify-center text-neutral-400 group-hover:text-brand-600 transition-colors">
                                        <FiBriefcase size={16} />
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-tighter">Title</label>
                                        <p className="text-sm font-bold text-black uppercase tracking-tighter">{userInfo?.role}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 group">
                                    <div className="w-8 h-8 rounded-lg bg-neutral-50 flex items-center justify-center text-neutral-400 group-hover:text-brand-600 transition-colors">
                                        <FiClock size={16} />
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-tighter">Created date</label>
                                        <p className="text-sm font-bold text-black">{formatDate(userInfo?.createdAt)}</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <AnimatePresence>
                            {isEditing && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="flex justify-end pt-4"
                                >
                                    <button
                                        type="submit"
                                        disabled={updateLoading}
                                        className="px-10 h-11 rounded-xl bg-brand-500 text-white font-bold text-sm hover:bg-brand-600 transition-all flex items-center justify-center gap-2 shadow-lg"
                                    >
                                        {updateLoading ? <FiRefreshCw className="animate-spin" /> : 'Save Changes'}
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </form>
                </div>

                {/* ── Right Column: Activity Feed ── */}
                <div className="lg:col-span-5 h-[calc(100vh-120px)] sticky top-4">
                    <section className="bg-neutral-50/50 rounded-3xl border border-neutral-100 h-full flex flex-col overflow-hidden">
                        <div className="p-6 border-b border-neutral-100 flex items-center justify-between bg-white sticky top-0 z-10">
                            <h3 className="text-sm font-bold flex items-center gap-2">
                                <FiActivity className="text-brand-600" /> Recent Activities
                            </h3>
                            <button
                                onClick={fetchMyActivities}
                                className={`p-2 text-neutral-400 hover:text-brand-600 transition-all ${actLoading && 'animate-spin'}`}
                                title="Refresh"
                            >
                                <FiRefreshCw size={14} />
                            </button>
                        </div>

                        <div className="flex-1 p-6 overflow-y-auto no-scrollbar scroll-smooth">
                            {activities.length > 0 ? (
                                <div className="space-y-6 relative">
                                    {/* Timeline Line */}
                                    <div className="absolute left-[11px] top-2 bottom-2 w-px bg-neutral-200" />

                                    {activities.map((log, index) => {
                                        const date = new Date(log.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' });
                                        const time = new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                                        return (
                                            <div key={log._id || index} className="flex gap-4 relative group">
                                                <div className="w-6 h-6 rounded-full bg-white border-2 border-neutral-200 flex-shrink-0 flex items-center justify-center z-10 group-hover:border-brand-500 transition-colors">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-neutral-300 group-hover:bg-brand-600 transition-colors" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-0.5">
                                                        <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">{date} • {time}</span>
                                                    </div>
                                                    <p className="text-xs font-semibold text-neutral-800 leading-snug">
                                                        {log.description}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40 py-20">
                                    <FiClock size={40} className="text-neutral-300" />
                                    <p className="text-xs font-black text-neutral-400 uppercase tracking-widest">No timeline data available</p>
                                </div>
                            )}
                        </div>

                        <div className="p-6 border-t border-neutral-100 flex justify-center bg-white/50">
                            <button className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 hover:text-brand-600 transition-colors">
                                View Security Log History
                            </button>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
