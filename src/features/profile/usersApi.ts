import { api } from '@/lib/api'
import type { UserAccount } from '@/types/user'

export interface UpdateProfilePayload {
  full_name?: string
  department_id?: number | null
}

export const usersApi = {
  me: () => api.get<UserAccount>('/users/me').then((r) => r.data),

  updateMe: (data: UpdateProfilePayload) =>
    api.patch<UserAccount>('/users/me', data).then((r) => r.data),
}
