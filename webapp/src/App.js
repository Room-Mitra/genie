import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import React, { Suspense, lazy } from 'react';
import { AuthProvider } from './Modules/Login/AuthContext';
import ProtectedRoute from './Modules/Login/ProtectedRoute';
import { NotificationProvider } from './Common/Notification/NotificationContext';
import { Navigate } from 'react-router-dom';

const Intents = lazy(() => import('./Modules/Intents/Intents'));
const Rooms = lazy(() => import('./Modules/Rooms/Rooms'));
const CheckIn = lazy(() => import('./Modules/CheckIn/CheckIn'));
const FaqEditor = lazy(() => import('./Modules/FAQ/FaqEditor'));
const CheckOut = lazy(() => import('./Modules/Checkout/Checkout'));
const Devices = lazy(() => import('./Modules/AdminModule/Pages/Devices/index'));
const StaffDirectory = lazy(
  () => import('./Modules/AdminModule/Pages/StaffDirectory/StaffDirectory')
);
const StaffRequestMapping = lazy(
  () => import('./Modules/AdminModule/Pages/StaffRequestMapping/StaffRequestMapping')
);
const HotelAnalyticsDashboard = lazy(() => import('./Modules/Analytics/HotelAnalyticsDashboard'));
const Sidebar = lazy(() => import('./Common/SideBar/Sidebar'));
const Login = lazy(() => import('./Modules/Login/Login'));
const Logout = lazy(() => import('./Modules/Login/Logout'));

function App() {
  return (
    <NotificationProvider>
      <Router>
        <AuthProvider>
          <Sidebar />

          <Routes>
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/logout" element={<Logout />} />
            <Route
              path="/requests"
              element={
                <ProtectedRoute>
                  <Intents />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/devices"
              element={
                <ProtectedRoute>
                  <Suspense fallback={<div>Devices are loading please wait...</div>}>
                    <Devices />
                  </Suspense>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/staff-directory"
              element={
                <ProtectedRoute>
                  <Suspense fallback={<div>Staff details are loading please wait...</div>}>
                    <StaffDirectory />
                  </Suspense>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/staff-request-mapping"
              element={
                <ProtectedRoute>
                  <Suspense fallback={<div>Staff mapping details are loading please wait...</div>}>
                    <StaffRequestMapping />
                  </Suspense>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/rooms"
              element={
                <ProtectedRoute>
                  <Rooms />
                </ProtectedRoute>
              }
            />
            <Route
              path="/check-in"
              element={
                <ProtectedRoute>
                  <CheckIn />
                </ProtectedRoute>
              }
            />
            <Route
              path="/check-out"
              element={
                <ProtectedRoute>
                  <CheckOut />
                </ProtectedRoute>
              }
            />
            <Route
              path="/faq"
              element={
                <ProtectedRoute>
                  <FaqEditor />
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <ProtectedRoute>
                  <HotelAnalyticsDashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </Router>
    </NotificationProvider>
  );
}

export default App;
