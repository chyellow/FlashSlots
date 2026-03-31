import "./App.css"
import { Routes, Route, Navigate } from "react-router"
import { VendorLayout } from "./views/vendor/layout"
import { VendorAppointmentsPage } from "./views/vendor/appointments"
import { VendorPostPage } from "./views/vendor/post"
import { VendorAboutPage } from "./views/vendor/about"
import { VendorHelpPage } from "./views/vendor/help"
import { ClientLayout } from "./views/client/layout"
import { ClientHomePage } from "./views/client/home"
import { ClientAboutPage } from "./views/client/about"
import { ClientHelpPage } from "./views/client/help"
import HomeView from "./views/home"
import ProfileView from "./views/profile"
import PageNotFoundView from "./views/not-found"
import { Header } from "./components/layout/header"
import { ThemeToggle } from "./components/layout/theme-toggle"

function App() {
  return (
    <div className="relative flex min-h-screen w-full flex-col">
      {/* navbar */}
      <Header />

      {/* theme toggle */}
      <ThemeToggle />

      <div className="flex min-h-0 w-full flex-1 flex-col pt-16">
        <Routes>
          <Route path="/FlashSlots/" element={<HomeView />} />
          <Route path="/FlashSlots/client" element={<ClientLayout />}>
            <Route index element={<ClientHomePage />} />
            <Route path="about" element={<ClientAboutPage />} />
            <Route path="help" element={<ClientHelpPage />} />
          </Route>
          <Route path="/FlashSlots/vendor" element={<VendorLayout />}>
            <Route index element={<Navigate to="appointments" replace />} />
            <Route path="appointments" element={<VendorAppointmentsPage />} />
            <Route path="post" element={<VendorPostPage />} />
            <Route path="about" element={<VendorAboutPage />} />
            <Route path="help" element={<VendorHelpPage />} />
          </Route>
          <Route path="/FlashSlots/profile/:username" element={<ProfileView />} />
          <Route path="*" element={<PageNotFoundView />} />
        </Routes>
      </div>
    </div>
  )
}

export default App