import { User, Appointment, DoctorProfile } from '../types';
import { API_BASE_URL, JWT_TOKEN_KEY } from '../constants';

interface LoginCredentials {
  email: string;
  password?: string;
}

interface SignupData extends LoginCredentials {
  name: string;
  // role is determined by backend during signup (defaults to client)
}

const getAuthHeaders = () => {
  const token = localStorage.getItem(JWT_TOKEN_KEY);
  return token ? { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
};

const handleResponse = async (response: Response) => {
  const data = await response.json();
  if (!response.ok) {
    const error = (data && data.message) || response.statusText;
    throw new Error(error);
  }
  return data;
};

// --- Auth Service ---
export const loginUser = async (credentials: LoginCredentials): Promise<{user:User, token: string}> => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });
  return handleResponse(response);
};

export const signupUser = async (data: SignupData): Promise<{user:User, token: string}> => {
  const response = await fetch(`${API_BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data), // Backend will set role to client
  });
  return handleResponse(response);
};

export const getCurrentUser = async (): Promise<User> => {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};


// --- Appointment Service ---
export const createAppointment = async (appointmentData: Omit<Appointment, 'id' | '_id' | 'status' | 'clientId' | 'clientName'> & {doctorId: string, doctorName: string}): Promise<Appointment> => {
  const response = await fetch(`${API_BASE_URL}/appointments`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(appointmentData),
  });
  return handleResponse(response);
};

export const getAppointmentsForClient = async (): Promise<Appointment[]> => {
  const response = await fetch(`${API_BASE_URL}/appointments/client`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

export const getAppointmentsForDoctor = async (): Promise<Appointment[]> => {
  const response = await fetch(`${API_BASE_URL}/appointments/doctor`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

export const updateAppointmentStatus = async (appointmentId: string, status: Appointment['status']): Promise<Appointment> => {
  const response = await fetch(`${API_BASE_URL}/appointments/${appointmentId}/status`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status }),
  });
  return handleResponse(response);
};

export const cancelAppointmentByClient = async (appointmentId: string): Promise<{message: string}> => {
  const response = await fetch(`${API_BASE_URL}/appointments/${appointmentId}/cancel`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

// --- Doctor Service ---
export const getAvailableDoctors = async (): Promise<DoctorProfile[]> => {
    const response = await fetch(`${API_BASE_URL}/doctors`, {
        method: 'GET',
        headers: getAuthHeaders(),
    });
    return handleResponse(response);
};
