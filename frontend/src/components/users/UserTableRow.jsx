import { FiMail, FiShield, FiCalendar, FiUserCheck, FiUserX, FiAlertCircle, FiTrash2 } from 'react-icons/fi';

const UserTableRow = ({ user, isSelf, onUpdateStatus, onDeleteClick }) => {
    const isActive = user.status === 'active';

    const statusStyles = {
        active: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        inactive: 'bg-neutral-50 text-neutral-400 border-neutral-100',
        suspended: 'bg-amber-50 text-amber-600 border-amber-100',
        deleted: 'bg-red-50 text-red-600 border-red-100'
    };

    return (
        <tr className={`hover:bg-neutral-50/50 transition-colors group ${!isActive && 'opacity-60'}`}>
            <td className="px-8 py-5">
                <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm transition-colors
                        ${isActive ? 'bg-brand-50 text-brand-600' : 'bg-neutral-100 text-neutral-400'}
                    `}>
                        {user.name.charAt(0)}
                    </div>
                    <div>
                        <p className="font-bold text-neutral-900 leading-none mb-1">{user.name}</p>
                        <div className="flex items-center gap-1.5 text-blue-600">
                            <FiMail size={12} />
                            <span className="text-xs font-medium">{user.email}</span>
                        </div>
                    </div>
                </div>
            </td>
            <td className="px-8 py-5">
                <div className="flex justify-center">
                    <span className={`
                        px-3 py-1 rounded-lg text-[12px] font-black tracking-tighter flex items-center gap-1.5
                        ${user.role === 'admin' ? 'bg-purple-50 text-purple-600' :
                            user.role === 'supervisor' ? 'bg-amber-50 text-amber-600' : 'bg-indigo-50 text-indigo-600'}
                    `}>
                        <FiShield size={10} />
                        {user.role}
                    </span>
                </div>
            </td>
            <td className="px-8 py-5 text-center">
                <div className="flex flex-col items-center gap-1 text-neutral-500">
                    <div className="flex items-center gap-1.5 font-bold tracking-tight">
                        <FiCalendar size={12} />
                        <span className="text-xs">{new Date(user.createdAt).toLocaleDateString()}</span>
                    </div>
                </div>
            </td>
            <td className="px-8 py-5">
                <div className="flex justify-center">
                    <span className={`px-3 py-1 rounded-lg text-[12px] font-black tracking-widest border uppercase animate-in fade-in duration-300 ${statusStyles[user.status] || statusStyles.inactive}`}>
                        {user.status}
                    </span>
                </div>
            </td>
            <td className="px-8 py-5 text-right">
                <div className="flex justify-end gap-2 items-center">
                    {!isActive && (
                        <button
                            onClick={() => onUpdateStatus(user.id || user._id, 'active')}
                            disabled={isSelf}
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all duration-300 disabled:opacity-20"
                            title="Activate Account"
                        >
                            <FiUserCheck size={16} />
                        </button>
                    )}

                    {isActive && (
                        <button
                            onClick={() => onUpdateStatus(user.id || user._id, 'inactive')}
                            disabled={isSelf}
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-neutral-100 text-neutral-500 hover:bg-neutral-600 hover:text-white transition-all duration-300 disabled:opacity-20"
                            title="Deactivate Account"
                        >
                            <FiUserX size={16} />
                        </button>
                    )}

                    {user.status !== 'suspended' && (
                        <button
                            onClick={() => onUpdateStatus(user.id || user._id, 'suspended')}
                            disabled={isSelf}
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white transition-all duration-300 disabled:opacity-20"
                            title="Suspend Account"
                        >
                            <FiAlertCircle size={16} />
                        </button>
                    )}

                    <button
                        onClick={onDeleteClick}
                        disabled={isSelf}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-600 hover:text-white transition-all duration-300 disabled:opacity-20"
                        title="Delete Account Permanently"
                    >
                        <FiTrash2 size={16} />
                    </button>
                </div>
            </td>
        </tr>
    );
};

export default UserTableRow;
