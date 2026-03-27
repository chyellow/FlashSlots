import { useState } from 'react';
import './App.css'
import { Routes, Route, Navigate } from "react-router"
import { VendorView } from './views/VendorView';
import { ClientView } from './views/ClientView';
import  HomeView  from './views/HomeView';
import  ProfileView  from './views/ProfileView';
import { getTheme, applyTheme } from "@/lib/theme"
import PageNotFoundView from './views/PageNotFoundView';
import LoginView from './views/LoginView';
import RegisterView from './views/RegisterView';
import { ProtectedRoute } from './components/ProtectedRoute';



function ThemeToggle() {
  const [theme, setTheme] = useState(getTheme())
  return (
    <button
      onClick={() => {
        const next = theme === "dark" ? "light" : "dark"
        applyTheme(next)
        setTheme(next)
      }}
    >
      Theme: {theme}
    </button>
  )
}


function App() {
  return (
    <div className="w-full flex items-center justify-start h-screen flex-col">
      <ThemeToggle />

      {/* The route decides what renders below the tabs */}
      <Routes>
        <Route path="/FlashSlots/" element={<HomeView />} />
        <Route path="/FlashSlots/client" element={
        <ProtectedRoute requiredRole="CLIENT">
          <ClientView />
        </ProtectedRoute>
      } />
      <Route path="/FlashSlots/vendor" element={
        <ProtectedRoute requiredRole="BUSINESS">
          <VendorView />
        </ProtectedRoute>
      } />
        <Route path="/FlashSlots/profile/:username" element={<ProfileView />} />
        <Route path="/FlashSlots/login" element={<LoginView />} />
        <Route path="/FlashSlots/register" element={<RegisterView />} />
        {/* Add future routes here, e.g.: */}
        <Route path="*" element={<PageNotFoundView />}/>
      </Routes>
    </div>
  );
}

// https://www.abui.io/?utm_source=ui.shadcn.com&utm_medium=referral&utm_campaign=directory
export default App;
