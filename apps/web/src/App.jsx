import './App.css'
import { Routes, Route, Navigate } from "react-router"
import { VendorLayout } from './views/vendor/layout'
import { ClientLayout } from './views/client/layout'
import HomeView from './views/home'
import ProfileView from './views/profile'
import PageNotFoundView from './views/not-found'
import LoginView from './views/login'
import RegisterView from './views/register'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Header } from './components/layout/header'
import { ThemeToggle } from './components/layout/theme-toggle'

import { ClientHomePage } from './views/client/home'
import { FindOpenAppointments } from './views/client/appointments'
import { ClientAppointments } from './views/client/post'
import { ClientAboutPage } from './views/client/about'
import { ClientHelpPage } from './views/client/help'

import { VendorAppointmentsPage } from './views/vendor/appointments'
import { VendorPostPage } from './views/vendor/post'
import { VendorAboutPage } from './views/vendor/about'
import { VendorHelpPage } from './views/vendor/help'

function App() {
  return (
    <div className="relative flex min-h-screen w-full flex-col">
      <Header />
      <ThemeToggle />

      <div className="flex min-h-0 w-full flex-1 flex-col pt-16">
        <Routes>
          <Route path="/" element={<Navigate to="/FlashSlots/" replace />} />
          <Route path="/FlashSlots" element={<Navigate to="/FlashSlots/" replace />} />

          <Route path="/FlashSlots/" element={<HomeView />} />

          <Route
            path="/FlashSlots/client"
            element={
              <ProtectedRoute requiredRole="CLIENT">
                <ClientLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<ClientHomePage />} />
            <Route path="appointments" element={<FindOpenAppointments />} />
            <Route path="post" element={<ClientAppointments />} />
            <Route path="about" element={<ClientAboutPage />} />
            <Route path="help" element={<ClientHelpPage />} />
          </Route>

          <Route
            path="/FlashSlots/vendor"
            element={
              <ProtectedRoute requiredRole="BUSINESS">
                <VendorLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="appointments" replace />} />
            <Route path="appointments" element={<VendorAppointmentsPage />} />
            <Route path="post" element={<VendorPostPage />} />
            <Route path="about" element={<VendorAboutPage />} />
            <Route path="help" element={<VendorHelpPage />} />
          </Route>

          <Route path="/FlashSlots/profile/:username" element={<ProfileView />} />
          <Route path="/FlashSlots/login" element={<LoginView />} />
          <Route path="/FlashSlots/register" element={<RegisterView />} />

          <Route path="*" element={<PageNotFoundView />} />
        </Routes>
      </div>
    </div>
  )
}

export default App