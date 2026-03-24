import { useState } from 'react';
import './App.css'
import { Moon, Sun } from "lucide-react"
import { Routes, Route, Navigate } from "react-router"
import { Button } from "@/components/ui/button"
import { VendorLayout } from './views/vendor/VendorLayout';
import { VendorAppointmentsPage } from './views/vendor/VendorAppointmentsPage';
import { VendorPostPage } from './views/vendor/VendorPostPage';
import { VendorAboutPage } from './views/vendor/VendorAboutPage';
import { VendorHelpPage } from './views/vendor/VendorHelpPage';
import { ClientView } from './views/ClientView';
import  HomeView  from './views/HomeView';
import  ProfileView  from './views/ProfileView';
import { getTheme, applyTheme } from "@/lib/theme"
import PageNotFoundView from './views/PageNotFoundView';


function ThemeToggle() {
  const [theme, setTheme] = useState(getTheme())
  const isDark = theme === "dark"
  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      className="size-9 border-border bg-background/90 shadow-sm backdrop-blur-sm"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => {
        const next = isDark ? "light" : "dark"
        applyTheme(next)
        setTheme(next)
      }}
    >
      {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </Button>
  )
}


function App() {
  return (
    <div className="relative flex min-h-screen w-full flex-col">
      <div className="fixed top-3 left-3 z-[100]">
        <ThemeToggle />
      </div>

      <div className="flex min-h-0 w-full flex-1 flex-col">
      <Routes>
        <Route path="/FlashSlots/" element={<HomeView />} />
        <Route path ="/FlashSlots/client" element = {<ClientView />}/>
        <Route path="/FlashSlots/vendor" element={<VendorLayout />}>
          <Route index element={<Navigate to="appointments" replace />} />
          <Route path="appointments" element={<VendorAppointmentsPage />} />
          <Route path="post" element={<VendorPostPage />} />
          <Route path="about" element={<VendorAboutPage />} />
          <Route path="help" element={<VendorHelpPage />} />
        </Route>
        <Route path="/FlashSlots/profile/:username" element={<ProfileView />} />
        {/* Add future routes here, e.g.: */}
        <Route path="*" element={<PageNotFoundView />}/>
      </Routes>
      </div>
    </div>
  );
}

// https://www.abui.io/?utm_source=ui.shadcn.com&utm_medium=referral&utm_campaign=directory
export default App;
