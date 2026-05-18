import { motion } from 'framer-motion';
import supervisorImg from "../../assets/Dashboard/Supervisor.png";
import adminImg from "../../assets/Dashboard/Admin.png";
import userImg from "../../assets/Dashboard/User.png";

// Placeholders for future images - User will provide these in assets/Dashboard/
// For now, using high-quality icon-based circles with themed colors
const StatCircles = ({ stats, loading }) => {
    const roles = [
        {
            key: 'user',
            label: 'Standard Users',
            count: stats.user,
            color: 'bg-emerald-500',
            iconColor: 'text-emerald-500',
            borderColor: 'border-emerald-100',
            image: userImg
        },
        {
            key: 'supervisor',
            label: 'Supervisors',
            count: stats.supervisor,
            color: 'bg-indigo-600',
            iconColor: 'text-indigo-600',
            borderColor: 'border-indigo-100',
            image: supervisorImg
        },
        {
            key: 'admin',
            label: 'Administrators',
            count: stats.admin,
            color: 'bg-brand-600',
            iconColor: 'text-brand-600',
            borderColor: 'border-brand-100',
            image: adminImg
        }
    ];

    return (
        <div className="flex flex-wrap justify-center md:justify-start gap-12 py-6">
            {roles.map((role, index) => (
                <motion.div
                    key={role.key}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex flex-col items-center text-center group"
                >
                    {/* Circular Image Container */}
                    <div className="w-24 h-24 rounded-full mb-4 group-hover:scale-105 transition-transform duration-300 relative overflow-hidden">
                        <img
                            src={role.image}
                            alt={role.label}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                    </div>

                    {/* Stats Info */}
                    <div className="space-y-0.5">
                        <h4 className="text-3xl font-black text-neutral-900 tracking-tighter">
                            {loading ? '...' : role.count}
                        </h4>
                        <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest leading-none">
                            {role.label}
                        </p>
                    </div>
                </motion.div>
            ))}


        </div>
    );
};

export default StatCircles;
