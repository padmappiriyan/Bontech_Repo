const UserDirectoryFilters = ({ currentFilter, onFilterChange }) => {
    const filters = [
        { id: 'all', label: 'All' },
        { id: 'admin', label: 'Admins' },
        { id: 'supervisor', label: 'Supervisors' },
        { id: 'user', label: 'Users' }
    ];

    return (
        <div className="flex items-center bg-white gap-10 py-2 rounded-2xl p-4">
            <h2 className="text-xl font-bold text-[#00426d] tracking-tight">System Directory</h2>
            <div className="flex items-center gap-6">
                {filters.map((role) => (
                    <button
                        key={role.id}
                        onClick={() => onFilterChange(role.id)}
                        className={`text-sm font-bold transition-all duration-300 relative ${currentFilter === role.id
                            ? 'text-neutral-900 bg-neutral-100 px-4 py-1.5 rounded-full shadow-sm'
                            : 'text-neutral-400 hover:text-neutral-600'
                            }`}
                    >
                        {role.label}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default UserDirectoryFilters;
