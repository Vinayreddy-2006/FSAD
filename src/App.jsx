import React, { useContext, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import { AuthContext } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';

import Landing from './pages/Landing';
import Login from './pages/LoginSecure';
import Register from './pages/RegisterEnhanced';
import Header from './components/Header';
import AdminDashboard from './pages/AdminDashboard';
import DonorDashboard from './pages/DonorDashboard';
import RecipientDashboard from './pages/RecipientDashboard';
import LogisticsDashboard from './pages/LogisticsDashboard';

function AppContent() {
  const { role } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (role && window.location.pathname === '/') {
      navigate(`/${role}`);
    }
  }, [role, navigate]);

  return (
    <>
      <Header />
      <div className="page-wrapper">
        {role && <Sidebar />}

        <div style={{ flex: 1, width: '100%', minWidth: 0 }}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/donor"
              element={
                <ProtectedRoute allowedRoles={['donor']}>
                  <DonorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/recipient"
              element={
                <ProtectedRoute allowedRoles={['recipient']}>
                  <RecipientDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/logistics"
              element={
                <ProtectedRoute allowedRoles={['logistics']}>
                  <LogisticsDashboard />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </div>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
