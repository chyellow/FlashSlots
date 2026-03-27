import { useState } from 'react';
import './App.css'
import { Routes, Route, Navigate } from "react-router"
import { Button } from "@/components/ui/button"
import { VendorLayout } from './views/vendor/VendorLayout';
import { VendorAppointmentsPage } from './views/vendor/VendorAppointmentsPage';
import { VendorPostPage } from './views/vendor/VendorPostPage';
import { VendorAboutPage } from './views/vendor/VendorAboutPage';
import { VendorHelpPage } from './views/vendor/VendorHelpPage';
import { ClientLayout } from './views/client/ClientLayout';
import { ClientHomePage } from './views/client/ClientHomePage';
import { ClientAppointmentsPage } from './views/client/ClientAppointmentsPage';
import { ClientPostPage } from './views/client/ClientPostPage';
import { ClientAboutPage } from './views/client/ClientAboutPage';
import { ClientHelpPage } from './views/client/ClientHelpPage';
import { ClientView } from './views/ClientView';
import  HomeView  from './views/HomeView';
import  ProfileView  from './views/ProfileView';
import PageNotFoundView from './views/PageNotFoundView';


function App() {
  return (
    <div className="relative flex min-h-screen w-full flex-col">
      <div className="flex min-h-0 w-full flex-1 flex-col">
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
        {/* Add future routes here, e.g.: */}
        <Route path="*" element={<PageNotFoundView />}/>
      </Routes>
      </div>
    </div>
  );
}

// https://www.abui.io/?utm_source=ui.shadcn.com&utm_medium=referral&utm_campaign=directory
export default App;
