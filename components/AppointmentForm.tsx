import React, { useState, useEffect } from 'react';
import { Appointment, DoctorProfile } from '../types'; // Use DoctorProfile
import Input from './common/Input';
import Button from './common/Button';
import { IconSparkles } from '../constants';
import { suggestSymptomDetails } from '../services/geminiService';
import * as apiService from '../services/apiService'; // Import apiService

interface AppointmentFormProps {
  onSubmit: (appointmentData: Omit<Appointment, 'id' | '_id' | 'clientId' | 'clientName' | 'status'>) => Promise<void>;
  initialData?: Partial<Appointment>;
  submitButtonText?: string;
}

const AppointmentForm: React.FC<AppointmentFormProps> = ({ onSubmit, initialData, submitButtonText = "Book Appointment" }) => {
  const [dateTime, setDateTime] = useState('');
  const [description, setDescription] = useState('');
  const [doctorId, setDoctorId] = useState(''); // Will be User ID of doctor
  const [availableDoctors, setAvailableDoctors] = useState<DoctorProfile[]>([]);
  const [symptomDetails, setSymptomDetails] = useState('');
  const [symptomSuggestions, setSymptomSuggestions] = useState<string[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      setIsLoadingDoctors(true);
      try {
        const doctors = await apiService.getAvailableDoctors();
        setAvailableDoctors(doctors);
        if (doctors.length > 0 && !initialData?.doctorId) {
          setDoctorId(doctors[0]._id || doctors[0].userId || ''); // Use _id from User model, which acts as DoctorProfile id
        }
      } catch (err) {
        console.error("Failed to fetch doctors", err);
        setError("Could not load doctor list.");
      } finally {
        setIsLoadingDoctors(false);
      }
    };
    fetchDoctors();
  }, [initialData?.doctorId]);

  useEffect(() => {
    if (initialData) {
      setDateTime(initialData.dateTime ? new Date(initialData.dateTime).toISOString().substring(0, 16) : '');
      setDescription(initialData.description || '');
      setDoctorId(initialData.doctorId || (availableDoctors[0]?._id || availableDoctors[0]?.userId || ''));
      setSymptomDetails(initialData.symptomDetails || '');
    }
  }, [initialData, availableDoctors]);

  const handleSymptomSuggestion = async () => {
    if (!description.trim()) {
      setError("Please enter a brief description of your issue first.");
      return;
    }
    setError(null);
    setIsSuggesting(true);
    try {
      const suggestions = await suggestSymptomDetails(description);
      setSymptomSuggestions(suggestions);
    } catch (e) {
      setError("Could not fetch symptom suggestions.");
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleAddSuggestion = (suggestion: string) => {
    setSymptomDetails(prev => prev ? `${prev}, ${suggestion}` : suggestion);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!dateTime || !description || !doctorId) {
        setError("Please fill in all required fields: Date/Time, Description, and Doctor.");
        return;
    }
    const selectedDoctor = availableDoctors.find(doc => (doc._id || doc.userId) === doctorId);
    if (!selectedDoctor) {
        setError("Selected doctor not found or list is empty.");
        return;
    }

    try {
      await onSubmit({
        dateTime,
        description,
        doctorId: selectedDoctor._id || selectedDoctor.userId, // Ensure this is the User ID of the doctor
        doctorName: selectedDoctor.name, // This is the display name
        symptomDetails,
      });
    } catch (err: any) {
        setError(err.message || "Failed to submit appointment.");
        throw err; // Re-throw for parent component to handle
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">{initialData ? 'Edit Appointment' : 'Book a New Appointment'}</h3>
      {error && <p className="text-sm text-danger bg-red-100 p-2 rounded">{error}</p>}
      
      <Input
        id="dateTime"
        label="Date and Time"
        type="datetime-local"
        value={dateTime}
        onChange={(e) => setDateTime(e.target.value)}
        required
      />
      
      <div>
        <label htmlFor="doctorId" className="block text-sm font-medium text-gray-700 mb-1">Select Doctor</label>
        {isLoadingDoctors ? <p>Loading doctors...</p> : (
        <select
          id="doctorId"
          value={doctorId}
          onChange={(e) => setDoctorId(e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
          disabled={availableDoctors.length === 0}
        >
          {availableDoctors.length === 0 && <option>No doctors available</option>}
          {availableDoctors.map((doc) => ( // doc is DoctorProfile, its _id or userId is the User ID.
            <option key={doc._id || doc.userId} value={doc._id || doc.userId}>{doc.name} ({doc.specialty})</option>
          ))}
        </select>
        )}
      </div>

      <Input
        id="description"
        label="Reason for Visit / Initial Symptoms"
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="e.g., Toothache, check-up, cleaning"
        required
      />
      
      {process.env.API_KEY && (
        <>
          <Button type="button" onClick={handleSymptomSuggestion} isLoading={isSuggesting} variant="outline" className="flex items-center text-sm">
             {IconSparkles} <span className="ml-2">Suggest Symptom Details (AI)</span>
          </Button>
          {symptomSuggestions.length > 0 && (
            <div className="mt-2 p-3 bg-teal-50 rounded-md">
              <p className="text-sm font-medium text-primary mb-1">AI Suggestions (click to add):</p>
              <div className="flex flex-wrap gap-2">
                {symptomSuggestions.map((sug, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleAddSuggestion(sug)}
                    className="px-2 py-1 bg-teal-100 text-teal-700 rounded-full text-xs hover:bg-teal-200"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div>
            <label htmlFor="symptomDetails" className="block text-sm font-medium text-gray-700 mb-1">Detailed Symptoms (Optional)</label>
            <textarea
              id="symptomDetails"
              rows={3}
              value={symptomDetails}
              onChange={(e) => setSymptomDetails(e.target.value)}
              placeholder="e.g., Sharp pain in lower left molar when drinking cold liquids, started 2 days ago."
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
            />
          </div>
        </>
      )}

      <Button type="submit" variant="primary" fullWidth isLoading={isLoadingDoctors}>
        {submitButtonText}
      </Button>
    </form>
  );
};

export default AppointmentForm;