import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Appointment, UserRole } from '../types';
import * as apiService from '../services/apiService';
import AppointmentCard from './AppointmentCard';
import LoadingSpinner from './LoadingSpinner';

const DoctorDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>('all');

  const fetchAppointments = useCallback(async () => {
    if (!currentUser || currentUser.role !== UserRole.DOCTOR) return;
    setIsLoading(true);
    setError(null);
    try {
      const doctorAppointments = await apiService.getAppointmentsForDoctor();
      // Ensure IDs are consistent
      const mappedAppointments = doctorAppointments.map(app => ({...app, id: app._id || app.id}));
      setAppointments(mappedAppointments.sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()));
    } catch (err: any) {
      setError(err.message || "Failed to load appointments.");
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
     if (currentUser && currentUser.role === UserRole.DOCTOR) {
      fetchAppointments();
    } else {
      setIsLoading(false); // Not a doctor or not logged in
    }
  }, [currentUser, fetchAppointments]);

  const handleUpdateStatus = async (appointmentId: string, status: Appointment['status']) => {
    if (!currentUser || !appointmentId) return;
    setError(null);
    try {
      await apiService.updateAppointmentStatus(appointmentId, status);
      fetchAppointments(); // Refresh list
    } catch (err: any) {
      setError(err.message || `Failed to update appointment status to ${status}.`);
    }
  };

  const filteredAppointments = appointments.filter(app => {
    if (filter === 'all') return true;
    return app.status === filter;
  });

  if (isLoading && !appointments.length) return <LoadingSpinner />;
  if (!currentUser || currentUser.role !== UserRole.DOCTOR && !isLoading) return <p className="text-center text-danger p-4">Qasja e ndaluar. Kjo faqe është vetëm për doktorët.</p>;
  
  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Doctor Appointmens</h1>
      
      {error && <p className="mb-4 text-sm text-danger bg-red-100 p-3 rounded-md">{error}</p>}

      <div className="mb-6">
        <label htmlFor="statusFilter" className="mr-2 font-medium text-gray-700">Filter by status:</label>
        <select 
          id="statusFilter"
          value={filter} 
          onChange={(e) => setFilter(e.target.value as Appointment['status'] | 'all')}
          className="p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Canceled</option>
        </select>
      </div>

      {isLoading && appointments.length > 0 && <p className="text-center py-4">Loading Appointments...</p>}

      {filteredAppointments.length === 0 && !isLoading && (
         <div className="text-center py-10 bg-white rounded-lg shadow">
          <img src="https://picsum.photos/seed/doctorview/300/200" alt="No appointments" className="mx-auto mb-4 rounded"/>
          <p className="text-gray-600 text-lg">No appointments match the current filter..</p>
        </div>
      )}

      <div className="space-y-6">
        {filteredAppointments.map(app => (
          <AppointmentCard 
            key={app.id || app._id} 
            appointment={app} 
            userRole={UserRole.DOCTOR}
            onConfirm={(id) => handleUpdateStatus(id, 'confirmed')}
            onCancel={(id) => handleUpdateStatus(id, 'cancelled')} // Doctors can cancel too
            onComplete={(id) => handleUpdateStatus(id, 'completed')}
          />
        ))}
      </div>
    </div>
  );
};

export default DoctorDashboard;