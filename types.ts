export enum UserRole {
  CLIENT = 'client',
  DOCTOR = 'doctor',
}

export interface User {
  _id?: string; // MongoDB ID
  id?: string; // Keep id for frontend consistency if needed, or map _id to id
  email: string;
  name: string;
  role: UserRole;
  password?: string; // For signup/login forms, not stored in frontend state
  token?: string; // JWT token
  specialty?: string; // Doctor specific
  doctorProfileId?: string; // For linking to a more detailed doctor profile if created
}

export interface Appointment {
  _id?: string; // MongoDB ID
  id?: string; // Keep id for frontend consistency
  clientId: string; // User ID of the client
  clientName: string;
  doctorId: string; // User ID of the doctor
  doctorName: string; 
  dateTime: string; // ISO string for date and time
  description: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  symptomDetails?: string; 
}

// Doctor type might represent the selectable doctors in the form
// These details would come from User objects with role 'doctor'
export interface DoctorProfile {
  _id?: string; // User ID of this doctor
  userId: string; // Corresponds to User._id
  name: string; // e.g., "Dr. Smith"
  specialty: string; // e.g., "General Dentistry"
  // other doctor-specific info like bio, office hours etc.
}
