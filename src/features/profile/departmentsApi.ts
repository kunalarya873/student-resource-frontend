import { api } from '@/lib/api'
import type { Department } from '@/types/department'

export const departmentsApi = {
  list: () => api.get<Department[]>('/departments').then((r) => r.data),
}
