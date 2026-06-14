import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AppLayout } from './components/AppLayout'
import { LoadingScreen } from './components/LoadingScreen'
import { AuthProvider, useAuth } from './context/AuthContext'
import { DataProvider } from './context/DataContext'
const DashboardPage = lazy(() => import('./pages/DashboardPage').then((module) => ({ default: module.DashboardPage })))
const ExpensesPage = lazy(() => import('./pages/ExpensesPage').then((module) => ({ default: module.ExpensesPage })))
const LoginPage = lazy(() => import('./pages/LoginPage').then((module) => ({ default: module.LoginPage })))
const ProductFormPage = lazy(() => import('./pages/ProductFormPage').then((module) => ({ default: module.ProductFormPage })))
const ProductsPage = lazy(() => import('./pages/ProductsPage').then((module) => ({ default: module.ProductsPage })))
const SaleFormPage = lazy(() => import('./pages/SaleFormPage').then((module) => ({ default: module.SaleFormPage })))
const SalesPage = lazy(() => import('./pages/SalesPage').then((module) => ({ default: module.SalesPage })))
const SettingsPage = lazy(() => import('./pages/SettingsPage').then((module) => ({ default: module.SettingsPage })))
const StatisticsPage = lazy(() => import('./pages/StatisticsPage').then((module) => ({ default: module.StatisticsPage })))

function AppRoutes() {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (!user) return <Suspense fallback={<LoadingScreen />}><Routes><Route path="*" element={<LoginPage />} /></Routes></Suspense>

  return (
    <DataProvider>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/produits" element={<ProductsPage />} />
            <Route path="/produits/nouveau" element={<ProductFormPage />} />
            <Route path="/produits/:id/modifier" element={<ProductFormPage />} />
            <Route path="/ventes" element={<SalesPage />} />
            <Route path="/ventes/nouvelle" element={<SaleFormPage />} />
            <Route path="/depenses" element={<ExpensesPage />} />
            <Route path="/statistiques" element={<StatisticsPage />} />
            <Route path="/parametres" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Suspense>
    </DataProvider>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            borderRadius: '12px',
            border: '1px solid #e4e9e5',
            boxShadow: '0 12px 35px rgba(23,62,50,.12)',
            color: '#17221d',
            fontSize: '14px',
          },
        }}
      />
    </BrowserRouter>
  )
}
