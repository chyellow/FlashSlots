import { useState } from 'react';
import './App.css'
import { Routes, Route, Navigate } from "react-router"
import { VendorLayout } from './views/vendor/layout';
import { ClientLayout } from './views/client/layout';
import  HomeView  from './views/home';
import  ProfileView  from './views/profile';
import { getTheme, applyTheme } from "@/lib/theme"
import PageNotFoundView from './views/not-found';
import LoginView from './views/login';
import RegisterView from './views/register';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Header } from './components/layout/header';
import { ThemeToggle } from './components/layout/theme-toggle';


function App() {
  return (
    <div className="relative flex min-h-screen w-full flex-col">
      {/* navbar */}
      <Header />

      {/* theme toggle */}
      <ThemeToggle />

      {/* The route decides what renders below the tabs */}
      <div className="flex min-h-0 w-full flex-1 flex-col pt-16">
      <Routes>
        <Route path="/FlashSlots/" element={<HomeView />} />
        <Route path="/FlashSlots/client" element={
        <ProtectedRoute requiredRole="CLIENT">
          <ClientLayout />
        </ProtectedRoute>
      } />
      <Route path="/FlashSlots/vendor" element={
        <ProtectedRoute requiredRole="BUSINESS">
          <VendorLayout />
        </ProtectedRoute>
      } />
        <Route path="/FlashSlots/profile/:username" element={<ProfileView />} />
        <Route path="/FlashSlots/login" element={<LoginView />} />
        <Route path="/FlashSlots/register" element={<RegisterView />} />
        {/* Add future routes here, e.g.: */}
        <Route path="*" element={<PageNotFoundView />}/>
      </Routes>
      </div>
    </div>
  );
}

// https://www.abui.io/?utm_source=ui.shadcn.com&utm_medium=referral&utm_campaign=directory
export default App;