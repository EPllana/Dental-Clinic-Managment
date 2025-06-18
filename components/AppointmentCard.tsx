
import React from 'react';
import { Appointment, UserRole } from '../types';
import { IconCalendar, IconClock, IconCheckCircle, IconXCircle } from '../constants';
import Button from './common/Button';

interface AppointmentCardProps {
  appointment: Appointment;
  userRole: UserRole;
  onCancel?: (appointmentId: string) => void;
  onConfirm?: (appointmentId: string) => void;
  onComplete?: (appointmentId: string) => void;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({ appointment, userRole, onCancel, onConfirm, onComplete }) => {
  const { dateTime, description, status, clientName, doctorName, symptomDetails } = appointment;
  const date = new Date(dateTime);

  const getStatusColor = () => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      case 'completed': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 mb-6 border-l-4 border-primary">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-xl font-semibold text-primary">
          {userRole === UserRole.CLIENT ? `Appointment with ${doctorName}` : `Appointment for ${clientName}`}
        </h3>
        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor()}`}>
          {status.toUpperCase()}
        </span>
      </div>
      
      <div className="space-y-2 text-gray-700">
        <div className="flex items-center">
          {IconCalendar}
          <span className="ml-2">{date.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
        <div className="flex items-center">
          {IconClock}
          <span className="ml-2">{date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        <p><span className="font-medium">Reason:</span> {description}</p>
        {symptomDetails && <p><span className="font-medium">Symptom Details:</span> {symptomDetails}</p>}
        {userRole === UserRole.DOCTOR && <p><span className="font-medium">Client:</span> {clientName}</p>}
        {userRole === UserRole.CLIENT && <p><span className="font-medium">Doctor:</span> {doctorName}</p>}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200 flex flex-wrap gap-2">
        {userRole === UserRole.CLIENT && status === 'pending' && onCancel && (
          <Button onClick={() => onCancel(appointment.id)} variant="danger" className="text-sm">Cancel</Button>
        )}
         {userRole === UserRole.CLIENT && status === 'confirmed' && onCancel && (
          <Button onClick={() => onCancel(appointment.id)} variant="danger" className="text-sm">Cancel</Button>
        )}
        {userRole === UserRole.DOCTOR && status === 'pending' && onConfirm && (
          <Button onClick={() => onConfirm(appointment.id)} variant="primary" className="text-sm flex items-center">
            {IconCheckCircle} <span className="ml-1">Confirm</span>
          </Button>
        )}
        {userRole === UserRole.DOCTOR && status === 'pending' && onCancel && (
          <Button onClick={() => onCancel(appointment.id)} variant="danger" className="text-sm flex items-center">
             {IconXCircle} <span className="ml-1">Cancel</span>
          </Button>
        )}
        {userRole === UserRole.DOCTOR && status === 'confirmed' && onComplete && (
          <Button onClick={() => onComplete(appointment.id)} variant="secondary" className="text-sm">Mark as Completed</Button>
        )}
      </div>
    </div>
  );
};

export default AppointmentCard;
    