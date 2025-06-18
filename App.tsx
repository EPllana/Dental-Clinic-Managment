
import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import AuthPage from './components/AuthPage';
import ClientDashboard from './components/ClientDashboard';
import DoctorDashboard from './components/DoctorDashboard';
import { useAuth } from './contexts/AuthContext';
import { UserRole } from './types';
import { ROUTE_PATHS, APP_NAME } from './constants'; // Import APP_NAME
import LoadingSpinner from './components/LoadingSpinner';

const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: UserRole[] }> = ({ children, allowedRoles }) => {
  const { currentUser, isLoading, token } = useAuth(); // Check token as well for initial load
  const location = useLocation();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!currentUser && !token) { // If no user and no token, definitely redirect
    return <Navigate to={ROUTE_PATHS.AUTH} state={{ from: location }} replace />;
  }
  
  // If there's a token but currentUser is not yet loaded, AuthContext useEffect will handle it.
  // If currentUser is loaded:
  if (currentUser && allowedRoles && !allowedRoles.includes(currentUser.role)) {
     if (currentUser.role === UserRole.CLIENT) {
        return <Navigate to={ROUTE_PATHS.CLIENT_DASHBOARD} replace />;
     } else if (currentUser.role === UserRole.DOCTOR) {
        return <Navigate to={ROUTE_PATHS.DOCTOR_DASHBOARD} replace />;
     }
     return <Navigate to={ROUTE_PATHS.HOME} replace />; 
  }

  // If currentUser is null but there is a token, it might mean user data is still fetching or token is invalid.
  // LoadingSpinner is shown by isLoading. If not loading and still no currentUser with a token, AuthContext should redirect.
  // For robustness, if for some reason we reach here without currentUser but with a role requirement, redirect.
  if (!currentUser && allowedRoles) {
     return <Navigate to={ROUTE_PATHS.AUTH} state={{ from: location }} replace />;
  }


  return <>{children}</>;
};


const App: React.FC = () => {
  const { currentUser, isLoading } = useAuth();


  if (isLoading) { // Global loading state for initial auth check
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path={ROUTE_PATHS.AUTH} element={
            currentUser ? ( // If user is loaded, redirect from /auth
              currentUser.role === UserRole.CLIENT ? <Navigate to={ROUTE_PATHS.CLIENT_DASHBOARD} /> : <Navigate to={ROUTE_PATHS.DOCTOR_DASHBOARD} />
            ) : (
              <AuthPage />
            )
          }/>
          
          <Route 
            path={ROUTE_PATHS.CLIENT_DASHBOARD} 
            element={
              <ProtectedRoute allowedRoles={[UserRole.CLIENT]}>
                <ClientDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path={ROUTE_PATHS.DOCTOR_DASHBOARD} 
            element={
              <ProtectedRoute allowedRoles={[UserRole.DOCTOR]}>
                <DoctorDashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path={ROUTE_PATHS.HOME} 
            element={
              currentUser ? (
                currentUser.role === UserRole.CLIENT ? <Navigate to={ROUTE_PATHS.CLIENT_DASHBOARD} replace /> : <Navigate to={ROUTE_PATHS.DOCTOR_DASHBOARD} replace />
              ) : (
                <Navigate to={ROUTE_PATHS.AUTH} replace /> // If not logged in, / goes to /auth
              )
            } 
          />
           <Route path="*" element={<Navigate to={ROUTE_PATHS.HOME} replace />} />
        </Routes>
      </main>
      <footer className="bg-gray-800 text-white text-center p-4 text-sm">
        © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
      </footer>
    </div>
  );
};

export default App;
