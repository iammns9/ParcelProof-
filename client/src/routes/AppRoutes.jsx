import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

// Layout
import AppLayout from '../components/layout/AppLayout';

// Auth Pages
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';

// Dashboard
import Dashboard from '../pages/dashboard/Dashboard';

// Parcel Pages
import ParcelList from '../pages/parcels/ParcelList';
import CreateParcel from '../pages/parcels/CreateParcel';
import ParcelDetails from '../pages/parcels/ParcelDetails';
import EditParcel from '../pages/parcels/EditParcel';

// Evidence Pages
import EvidenceLibrary from '../pages/evidence/EvidenceLibrary';
import UploadEvidence from '../pages/evidence/UploadEvidence';
import EvidenceDetails from '../pages/evidence/EvidenceDetails';

// Planned Modules
import ReturnsPlanned from '../pages/planned/ReturnsPlanned';
import DisputesPlanned from '../pages/planned/DisputesPlanned';
import ReportsPlanned from '../pages/planned/ReportsPlanned';

// Settings Pages
import SellerProfile from '../pages/settings/SellerProfile';
import AccountSettings from '../pages/settings/AccountSettings';

// Protected Route Guard
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner fullPage text="Checking authenticated session..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Public Route Guard (redirects already logged-in sellers to dashboard)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner fullPage text="Checking session..." />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />

      {/* Protected Routes inside AppLayout */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Module 2: Parcels */}
        <Route path="/parcels" element={<ParcelList />} />
        <Route path="/parcels/create" element={<CreateParcel />} />
        <Route path="/parcels/:id" element={<ParcelDetails />} />
        <Route path="/parcels/:id/edit" element={<EditParcel />} />

        {/* Module 3: Evidence */}
        <Route path="/evidence" element={<EvidenceLibrary />} />
        <Route path="/evidence/upload" element={<UploadEvidence />} />
        <Route path="/evidence/:id" element={<EvidenceDetails />} />

        {/* Planned Modules 4, 5, 6 */}
        <Route path="/returns" element={<ReturnsPlanned />} />
        <Route path="/disputes" element={<DisputesPlanned />} />
        <Route path="/reports" element={<ReportsPlanned />} />

        {/* Settings */}
        <Route path="/settings/profile" element={<SellerProfile />} />
        <Route path="/settings/account" element={<AccountSettings />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;
