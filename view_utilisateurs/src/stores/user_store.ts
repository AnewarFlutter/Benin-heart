import { EntityUser } from '@/modules/magasin/user/domain/entities/entity_user'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type UserState = {
    user: EntityUser | null
}

export type UserActions = {
    setUser: (user: EntityUser) => void
    setUserAction: (user: EntityUser) => void
}

export type UserStore = UserState & UserActions


export const createUserStore = (
    initState: EntityUser | null = null,
) => {
    persist<UserStore>(
        (set) => ({
            user: initState,
            setUser: (user) => set({ user }),
            setUserAction: (user) => set({ user })
        }),
        {
            name: 'current-user', // ← ce nom sera utilisé dans localStorage
        },
    )
}

export const useUserStore = create<UserStore>()(
    persist(
        (set) => ({
            user: null,
            setUser: (user: EntityUser) => set({ user }),
            setUserAction: (user: EntityUser) => set({ user })
        }),
        {
            name: 'current-user',
        }
    )
)
