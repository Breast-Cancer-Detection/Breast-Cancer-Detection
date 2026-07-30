import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { SkipLink } from '../components/layout/SkipLink'
import { AppShellLayout } from './AppShellLayout'
import { RouteEffects } from './RouteEffects'
import { LandingPage } from '../pages/LandingPage'
import { SignInPage } from '../pages/SignInPage'
import { WorkspacePage } from '../pages/WorkspacePage'
import { ProcessingPage } from '../pages/ProcessingPage'
import { ResultsPage } from '../pages/ResultsPage'
import { ModelPage } from '../pages/ModelPage'

export function AppRoutes() {
  return (
    <BrowserRouter>
      <SkipLink />
      <RouteEffects />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signin" element={<SignInPage />} />

        <Route element={<AppShellLayout />}>
          <Route path="/workspace" element={<WorkspacePage />} />
          <Route path="/processing" element={<ProcessingPage />} />
          <Route path="/results" element={<ResultsPage />} />
          <Route path="/model" element={<ModelPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
