import { Navigate, Route, Routes } from 'react-router-dom'

import { AppLayout } from '@/components/layout/AppLayout'
import { AuthLayout } from '@/features/auth/AuthLayout'
import { ProtectedRoute, PublicOnlyRoute } from '@/features/auth/guards'
import { ForgotPasswordPage } from '@/features/auth/pages/ForgotPasswordPage'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { SignupPage } from '@/features/auth/pages/SignupPage'
import { VerifyOtpPage } from '@/features/auth/pages/VerifyOtpPage'
import { DrivePage } from '@/features/drive/DrivePage'
import { SharedByMePage, SharedWithMePage, TeacherNotesPage } from '@/features/drive/SharedPages'
import { ProfilePage } from '@/features/profile/ProfilePage'
import { PublicSharePage } from '@/features/public/PublicSharePage'
import { SearchPage } from '@/features/search/SearchPage'

export default function App() {
  return (
    <Routes>
      {/* Public Share Links — accessible to anyone (both guests and signed-in members) */}
      <Route path="/s/:token" element={<PublicSharePage />} />

      {/* Auth pages — redirect away if already signed in */}
      <Route element={<PublicOnlyRoute />}>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/verify-otp" element={<VerifyOtpPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        </Route>
      </Route>

      {/* App — requires a session; shares the Drive layout (sidebar + top bar) */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<DrivePage />} />
          <Route path="/folders/:folderId" element={<DrivePage />} />
          <Route path="/shared" element={<SharedByMePage />} />
          <Route path="/shared-with-me" element={<SharedWithMePage />} />
          <Route path="/teacher-notes" element={<TeacherNotesPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
