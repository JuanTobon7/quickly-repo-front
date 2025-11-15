import { Navigate, Route, Routes } from 'react-router-dom';

import InventoryPage from '../pages/InventoryPage';
import PosPage from '../pages/PosPage';
import LoginPage from '../pages/LoginPage';
import HomePage from '../pages/HomePage';
import ThirdPartiesPage from '../pages/ThirdPartiesPage';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { isAuthenticated } from '../services/api/auth';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public route */}
      <Route 
        path="/login" 
        element={
          isAuthenticated() ? <Navigate to="/" replace /> : <LoginPage />
        } 
      />
      
      {/* Protected routes */}
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/inventory" 
        element={
          <ProtectedRoute>
            <InventoryPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/pos" 
        element={
          <ProtectedRoute>
            <PosPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/third-parties" 
        element={
          <ProtectedRoute>
            <ThirdPartiesPage />
          </ProtectedRoute>
        } 
      />
      
      {/* Redirects */}
      <Route 
        path="*" 
        element={
          isAuthenticated() ? <Navigate to="/" replace /> : <Navigate to="/login" replace />
        } 
      />
    </Routes>
  );
};

export default AppRoutes;
