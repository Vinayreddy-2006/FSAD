import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

// allowedRoles: array of strings
const ProtectedRoute = ({ allowedRoles, children }) => {
  const { role } = useContext(AuthContext);
  if (!role) {
    return <Navigate to="/login" replace />;
  }
  if (!allowedRoles.includes(role)) {
    // optionally redirect to user-specific dashboard
    return <Navigate to="/" replace />;
  }
  return children;
};

export default ProtectedRoute;
