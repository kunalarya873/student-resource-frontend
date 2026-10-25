export interface TokenResponse {
  access_token: string
  refresh_token: string
  token_type: string
}

export interface StorageQuota {
  quota_bytes: number
  used_bytes: number
  reserved_bytes: number
  available_bytes: number
}

export interface UserProfile {
  user_id: string
  email: string
  full_name: string
  role_name: string
  department_id: number | null
  department_name: string | null
  status: string
  quota: StorageQuota | null
}

export interface SignupResponse {
  user_id: string
  email: string
  full_name: string
  status: string
  message: string
}

export interface VerifyResponse {
  message: string
  access_token: string | null
  refresh_token: string | null
  token_type: string
  user_id: string | null
  email: string | null
  full_name: string | null
  role_name: string | null
}

export interface SignupPayload {
  email: string
  password: string
  full_name: string
  department_id?: number | null
  role_name?: string
}
