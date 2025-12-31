import { useRoleStore, UserRole } from '../../shared/stores/role-store';
import { Briefcase, GraduationCap, Users } from 'lucide-react';
import { motion } from 'framer-motion';

export function RoleSwitcher() {
    const { activeRole, setRole } = useRoleStore();

    const roles: { id: UserRole; label: string; icon: any; color: string }[] = [
        { id: 'manager', label: 'Manager', icon: Briefcase, color: 'text-blue-400' },
        { id: 'coach', label: 'Coach', icon: Users, color: 'text-orange-400' },
        { id: 'learner', label: 'Learner', icon: GraduationCap, color: 'text-emerald-400' },
    ];

    return (
        <div className="flex bg-[#1a1a1a] p-1 rounded-xl border border-white/5">
            {roles.map((role) => {
                const isActive = activeRole === role.id;
                const Icon = role.icon;

                return (
                    <button
                        key={role.id}
                        onClick={() => setRole(role.id)}
                        className={`
              relative px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm font-bold transition-all
              ${isActive ? 'text-white' : 'text-gray-500 hover:text-gray-300'}
            `}
                    >
                        {isActive && (
                            <motion.div
                                layoutId="activeRole"
                                className="absolute inset-0 bg-white/10 rounded-lg border border-white/5 shadow-sm"
                                transition={{ type: "spring", duration: 0.5 }}
                            />
                        )}
                        <Icon className={`w-4 h-4 relative z-10 ${isActive ? role.color : 'opacity-50'}`} />
                        <span className="relative z-10">{role.label}</span>
                    </button>
                );
            })}
        </div>
    );
}
