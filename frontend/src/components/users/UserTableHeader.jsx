const UserTableHeader = () => {
    const headers = [
        { label: 'User Details', align: 'left' },
        { label: 'Role', align: 'center' },
        { label: 'Joined Date', align: 'center' },
        { label: 'Status', align: 'center', className: 'uppercase tracking-widest' },
        { label: 'Account Control', align: 'right' }
    ];

    return (
        <thead>
            <tr className="bg-[#f2f4f6] border-b border-neutral-100">
                {headers.map((h, i) => (
                    <th 
                        key={i} 
                        className={`px-8 py-5 text-[11px] font-bold text-neutral-400 tracking-widest ${
                            h.align === 'center' ? 'text-center' : 
                            h.align === 'right' ? 'text-right' : ''
                        } ${h.className || ''}`}
                    >
                        {h.label}
                    </th>
                ))}
            </tr>
        </thead>
    );
};

export default UserTableHeader;
