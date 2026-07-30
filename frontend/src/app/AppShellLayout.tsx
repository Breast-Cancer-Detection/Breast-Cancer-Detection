import { Outlet } from 'react-router-dom'
import { AppHeader } from '../components/layout/AppHeader'

/** Layout for authenticated/app screens (workspace, processing, results, model). */
export function AppShellLayout() {
  return (
    <>
      <AppHeader />
      <main id="main-content">
        <Outlet />
      </main>
    </>
  )
}
