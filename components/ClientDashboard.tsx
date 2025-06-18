import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Appointment, UserRole } from '../types';
import * as apiService from '../services/apiService';
import AppointmentForm from './AppointmentForm';
import AppointmentCard from './AppointmentCard';
import LoadingSpinner from './LoadingSpinner';
import Button from './common/Button';
import { IconPlusCircle } from '../constants';

const ClientDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);

  const fetchAppointments = useCallback(async () => {
    if (!currentUser) return;
    setIsLoading(true);
    setError(null);
    try {
      const clientAppointments = await apiService.getAppointmentsForClient();
      // Ensure IDs are consistent if backend uses _id
      const mappedAppointments = clientAppointments.map(app => ({...app, id: app._id || app.id}));
      setAppointments(mappedAppointments.sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()));
    } catch (err: any) {
      setError(err.message || "Failed to load appointments.");
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      fetchAppointments();
    } else {
      setIsLoading(false); // Not logged in, stop loading
    }
  }, [currentUser, fetchAppointments]);

  const handleBookAppointment = async (appointmentData: Omit<Appointment, 'id' | '_id' | 'clientId' | 'clientName' | 'status'>) => {
    if (!currentUser) return Promise.reject(new Error("User not authenticated"));
    setError(null); // Clear previous errors
    try {
      // clientId and clientName will be set by the backend based on authenticated user
      await apiService.createAppointment(appointmentData);
      setShowAppointmentForm(false);
      fetchAppointments(); // Refresh list
    } catch (err: any) {
      // Error is set by AppointmentForm if API call fails due to validation or server issue
      // setError(err.message || "Failed to book appointment.");
      throw err; // Re-throw to allow AppointmentForm to handle its own error state
    }
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    if (!currentUser || !appointmentId) return;
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;
    setError(null);
    try {
      await apiService.cancelAppointmentByClient(appointmentId);
      fetchAppointments(); // Refresh list
    } catch (err: any) {
      setError(err.message || "Failed to cancel appointment.");
    }
  };

  if (isLoading && !appointments.length) return <LoadingSpinner />;
  if (!currentUser && !isLoading) return <p className="text-center text-danger p-4">You must be logged in to view this page.</p>;


  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Appointments </h1>
        <Button onClick={() => setShowAppointmentForm(!showAppointmentForm)} variant="primary" className="flex items-center">
          {IconPlusCircle}
          <span className="ml-2">{showAppointmentForm ? 'Close Form' : 'New Appointment'}</span>
        </Button>
      </div>

      {error && <p className="mb-4 text-sm text-danger bg-red-100 p-3 rounded-md">{error}</p>}
      
      {showAppointmentForm && (
        <div className="mb-8 p-4 bg-secondary rounded-lg shadow-md">
          <AppointmentForm onSubmit={handleBookAppointment} />
        </div>
      )}

      {appointments.length === 0 && !isLoading && !showAppointmentForm && (
        <div className="text-center py-10 bg-white rounded-lg shadow">
          <img src="https://picsum.photos/seed/dentalempty/300/200" alt="No appointments" className="mx-auto mb-4 rounded"/>
          <p className="text-gray-600 text-lg">You have no upcoming appointments.</p>
          <p className="text-gray-500">Click "New Appointment" to schedule one.</p>
        </div>
      )}
      
      {isLoading && appointments.length > 0 && <p className="text-center py-4">Loading updated appointments...</p>}

      <div className="space-y-6">
        {appointments.map(app => (
          <AppointmentCard 
            key={app.id || app._id} 
            appointment={app} 
            userRole={UserRole.CLIENT} 
            onCancel={() => handleCancelAppointment(app.id || app._id!)}
          />
        ))}
      </div>
    </div>
  );
};

export default ClientDashboard;