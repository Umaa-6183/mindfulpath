// src/pages/Admin/ProtectedRoute.js

import React from 'react';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children, userRole }) {
  if (userRole !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}
