import { useRoleStore, UserRole } from '../../shared/stores/role-store';
import { Briefcase, GraduationCap, Users } from 'lucide-react';
import { motion } from 'framer-motion';

export function RoleSwitcher() {
    const { activeRole, setRole } = useRoleStore();

    const roles: { id: UserRole; label: string; icon: any; color: string }[] = [
        { id: 'manager', label: 'Manager', icon: Briefcase, color: 'text-primary' },
        { id: 'coach', label: 'Coach', icon: Users, color: 'text-orange-600' },
        { id: 'learner', label: 'Learner', icon: GraduationCap, color: 'text-emerald-600' },
    ];

    return (
        <div className="flex bg-white border border-neutral-200 p-1">
            {roles.map((role) => {
                const isActive = activeRole === role.id;
                const Icon = role.icon;

                return (
                    <button
                        key={role.id}
                        onClick={() => setRole(role.id)}
                        className={`
              relative px-3 py-1.5 border rounded-none flex items-center gap-2 text-sm font-bold transition-all
              ${isActive ? 'bg-primary text-white border-primary' : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50 hover:text-neutral-900'}
            `}
                    >
                        {isActive && (
                            <motion.div
                                layoutId="activeRole"
                                className="absolute inset-0 bg-primary"
                                transition={{ type: "spring", duration: 0.5 }}
                            />
                        )}
                        <Icon className={`w-4 h-4 relative z-10 ${isActive ? role.color : 'text-neutral-400'}`} />
                        <span className="relative z-10">{role.label}</span>
                    </button>
                );
            })}
        </div>
    );
}