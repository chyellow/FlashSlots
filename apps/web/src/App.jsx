import { useState } from 'react';
import './App.css'
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Routes, Route, useNavigate, useLocation, Navigate } from "react-router"
import { VendorView } from './views/VendorView';
import { ClientView } from './views/ClientView';

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"

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
  const navigate = useNavigate();
  const location = useLocation();

   // Derive active tab from the current URL
  const currentTab = location.pathname.startsWith("/client")
    ? "client"
    : "business";

  return (
    <div className="w-full flex items-center justify-start h-screen flex-col">
      <h1 className="text-3xl">FlashSlots--Alpha Release</h1>
      <p className='mt-2.5'>
        FlashSlots is a real-time marketplace for last-minute service openings.
      </p>

      <Tabs
        value={currentTab}
        onValueChange={(value) => {

          // Tab is clicked, navigate to that route
          navigate(value === "client" ? "/client" : "/vendor");
        }}
        className="w-full max-w-4xl mt-5"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="business">Business</TabsTrigger>
          <TabsTrigger value="client">Client</TabsTrigger>
        </TabsList>
        <Separator />
      </Tabs>

      {/* The route decides what renders below the tabs */}
      <Routes>
        <Route path="/vendor" element={<VendorView />} />
        <Route path="/client" element={<ClientView />} />
        <Route path="*" element={<Navigate to="/vendor" replace />} />
      </Routes>
    </div>
  );
}

// https://www.abui.io/?utm_source=ui.shadcn.com&utm_medium=referral&utm_campaign=directory
export default App;
