import { api } from '@/lib/api'
import type {
  SignupPayload,
  SignupResponse,
  TokenResponse,
  UserProfile,
  VerifyResponse,
} from '@/types/auth'

export const authApi = {
  login: (email: string, password: string) =>
    api.post<TokenResponse>('/auth/login', { email, password }).then((r) => r.data),

  signup: (payload: SignupPayload) =>
    api
      .post<SignupResponse>('/auth/signup', { role_name: 'Student', ...payload })
      .then((r) => r.data),

  verifyOtp: (email: string, otp: string) =>
    api.post<VerifyResponse>('/auth/verify-otp', { email, otp }).then((r) => r.data),

  resendOtp: (email: string) =>
    api
      .post<{ message: string }>('/auth/resend-otp', { email })
      .then((r) => r.data),

  forgotPassword: (email: string) =>
    api
      .post<{ message: string }>('/auth/forgot-password', { email })
      .then((r) => r.data),

  resetPassword: (email: string, otp: string, newPassword: string) =>
    api
      .post<{ message: string }>('/auth/reset-password', {
        email,
        otp,
        new_password: newPassword,
      })
      .then((r) => r.data),

  me: () => api.get<UserProfile>('/auth/me').then((r) => r.data),

  logout: () => api.post('/auth/logout').then((r) => r.data),
}
