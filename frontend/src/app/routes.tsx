import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { GuestRoute } from '../auth/GuestRoute'
import { ProtectedRoute } from '../auth/ProtectedRoute'
import { SkipLink } from '../components/layout/SkipLink'
import { AppShellLayout } from './AppShellLayout'
import { RouteEffects } from './RouteEffects'
import { LandingPage } from '../pages/LandingPage'
import { SignInPage } from '../pages/SignInPage'
import { SignUpPage } from '../pages/SignUpPage'
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage'
import { ResetPasswordPage } from '../pages/ResetPasswordPage'
import { WorkspacePage } from '../pages/WorkspacePage'
import { ProcessingPage } from '../pages/ProcessingPage'
import { ResultsPage } from '../pages/ResultsPage'
import { ModelPage } from '../pages/ModelPage'
import { AboutPage } from '../pages/AboutPage'

export function AppRoutes() {
  return (
    <BrowserRouter>
      <SkipLink />
      <RouteEffects />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutPage />} />

        <Route element={<GuestRoute />}>
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        </Route>

        {/* Public: recovery links establish a session, then this page updates the password. */}
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppShellLayout />}>
            <Route path="/workspace" element={<WorkspacePage />} />
            <Route path="/processing" element={<ProcessingPage />} />
            <Route path="/results" element={<ResultsPage />} />
            <Route path="/model" element={<ModelPage />} />
            <Route path="/about" element={<AboutPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
