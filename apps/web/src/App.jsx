import { useState } from 'react';
import './App.css'
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Routes, Route, Navigate } from "react-router"
import { VendorView } from './views/VendorView';
import { ClientView } from './views/ClientView';

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"

import { getTheme, applyTheme } from "@/lib/theme"
import HomeView from './views/HomeView';

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
      

      {/* The route decides what renders below the tabs */}
      <Routes>
        <Route path="/" element={<HomeView />} />
        {/* Add future routes here, e.g.: */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

// https://www.abui.io/?utm_source=ui.shadcn.com&utm_medium=referral&utm_campaign=directory
export default App;
