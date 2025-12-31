import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'manager' | 'coach' | 'learner';

interface RoleState {
    activeRole: UserRole;
    setRole: (role: UserRole) => void;
    // Visual theme tokens mapped to roles
    getThemeColor: () => string;
}

export const useRoleStore = create<RoleState>()(
    persist(
        (set, get) => ({
            activeRole: 'manager', // Default start

            setRole: (role) => set({ activeRole: role }),

            getThemeColor: () => {
                const role = get().activeRole;
                switch (role) {
                    case 'manager': return 'blue';
                    case 'coach': return 'orange';
                    case 'learner': return 'emerald';
                    default: return 'slate';
                }
            }
        }),
        {
            name: 'secondbrain-role-storage',
        }
    )
);
