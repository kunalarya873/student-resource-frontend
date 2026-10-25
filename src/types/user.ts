export interface UserAccount {
  user_id: string
  email: string
  full_name: string
  role_id: number
  role_name: string
  department_id: number | null
  department_name: string | null
  status: string
  created_at: string
}
