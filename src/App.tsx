import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import PublicLayout from '@/components/layout/PublicLayout'
import AdminLayout from '@/components/admin/AdminLayout'
import ProtectedRoute from '@/components/admin/ProtectedRoute'
import Spinner from '@/components/ui/Spinner'
import { ADMIN_BASE } from '@/lib/constants'

const Home = lazy(() => import('@/pages/Home'))
const AddReport = lazy(() => import('@/pages/AddReport'))
const About = lazy(() => import('@/pages/About'))
const Statistics = lazy(() => import('@/pages/Statistics'))
const ReportsMap = lazy(() => import('@/pages/ReportsMap'))

const Login = lazy(() => import('@/pages/admin/Login'))
const Dashboard = lazy(() => import('@/pages/admin/Dashboard'))
const ReportsAdmin = lazy(() => import('@/pages/admin/ReportsAdmin'))
const ReportDetail = lazy(() => import('@/pages/admin/ReportDetail'))
const StatisticsAdmin = lazy(() => import('@/pages/admin/StatisticsAdmin'))
const Settings = lazy(() => import('@/pages/admin/Settings'))

function PageLoader() {
  return <Spinner className="h-10 w-10" />
}

function withSuspense(comp: React.ReactNode) {
  return <Suspense fallback={<PageLoader />}>{comp}</Suspense>
}

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={withSuspense(<Home />)} />
        <Route path="/report" element={withSuspense(<AddReport />)} />
        <Route path="/about" element={withSuspense(<About />)} />
        <Route path="/statistics" element={withSuspense(<Statistics />)} />
        <Route path="/map" element={withSuspense(<ReportsMap />)} />
      </Route>

      <Route path={`${ADMIN_BASE}/login`} element={withSuspense(<Login />)} />
      <Route
        path={ADMIN_BASE}
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={withSuspense(<Dashboard />)} />
        <Route path="reports" element={withSuspense(<ReportsAdmin />)} />
        <Route path="reports/:id" element={withSuspense(<ReportDetail />)} />
        <Route path="statistics" element={withSuspense(<StatisticsAdmin />)} />
        <Route path="settings" element={withSuspense(<Settings />)} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}