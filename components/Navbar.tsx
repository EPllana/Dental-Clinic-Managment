
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { APP_NAME, ROUTE_PATHS, IconUserCircle, IconLogout } from '../constants';
import { UserRole } from '../types';

const Navbar: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="bg-primary shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to={ROUTE_PATHS.HOME} className="text-white text-2xl font-bold">
              {APP_NAME}
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {currentUser ? (
              <>
                <span className="text-white hidden sm:block">
                  Welcome, {currentUser.name} ({currentUser.role})
                </span>
                {currentUser.role === UserRole.CLIENT && (
                  <Link
                    to={ROUTE_PATHS.CLIENT_DASHBOARD}
                    className="text-gray-200 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Appointments
                  </Link>
                )}
                {currentUser.role === UserRole.DOCTOR && (
                  <Link
                    to={ROUTE_PATHS.DOCTOR_DASHBOARD}
                    className="text-gray-200 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Doctor Appointments
                  </Link>
                )}
                 <button
                  onClick={handleLogout}
                  className="flex items-center text-gray-200 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  {IconLogout}
                  <span className="ml-1">LogOut</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to={ROUTE_PATHS.AUTH}
                  className="text-gray-200 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  Login / Sign Up
                </Link>
              </>
            )}
            <div className="text-white ml-2">
              {IconUserCircle}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
    