import { useState } from 'react';
import './App.css'
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Routes, Route, Navigate } from "react-router"
import { VendorView } from './views/VendorView';
import { ClientView } from './views/ClientView';
import  ProfileView  from './views/ProfileView';
import { getTheme, applyTheme } from "@/lib/theme"


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
        <Route path="/" element={<HomeView />} />
        <Route path ="/client" element = {<ClientView />}/>
        <Route path ="/vendor" element = {<VendorView />}/>
        <Route path="/profile/:username" element={<ProfileView />} />
        {/* Add future routes here, e.g.: */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

// https://www.abui.io/?utm_source=ui.shadcn.com&utm_medium=referral&utm_campaign=directory
export default App;
