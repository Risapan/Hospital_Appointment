export type Role = 'PATIENT' | 'DOCTOR' | 'RECEPTIONIST' | 'ADMIN';

export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';

export interface UserSummary {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  role: Role;
  doctorProfileId?: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  tokenType: string;
  user: UserSummary;
}

export interface DoctorHospital {
  id: string;
  name: string;
  sector?: string;
  address?: string;
}

export interface Doctor {
  id: string; // DoctorProfile ID
  userId: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  departmentId: string;
  departmentName: string;
  specialty: string;
  biography?: string;
  qualifications?: string;
  hospitalIds: string[];
  hospitals: DoctorHospital[];
  hospitalName?: string; // all hospital names joined, for display
  hospitalType?: string;
  consultationDurationMinutes: number;
  consultationFee: number;
  profileImageUrl?: string;
  experienceYears: number;
  roomNumber?: string;
  active: boolean;
}

export interface Hospital {
  id: string;
  name: string;
  type?: string;     // "Hospital", "Dental Clinic", ...
  sector?: string;   // "Private" | "Government"
  address?: string;
  city?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  website?: string;
  mapUrl?: string;
  description?: string;
  services: string[];
  active: boolean;
  doctorCount: number;
}

export interface Department {
  id: string;
  name: string;
  description: string;
  icon?: string;
  active: boolean;
}

export interface TimeSlot {
  startDateTime: string;
  endDateTime: string;
  available: boolean;
  reasonIfNotAvailable?: string;
}

export interface Availability {
  id?: string;
  doctorId: string;
  dayOfWeek: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
  startTime: string; // "09:00:00"
  endTime: string;   // "17:00:00"
  slotDurationMinutes: number;
  active: boolean;
}

export interface BlockedPeriod {
  id?: string;
  doctorId: string;
  startDateTime: string;
  endDateTime: string;
  reasonCategory: string;
  reasonNote?: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  roomNumber?: string;
  departmentId: string;
  departmentName: string;
  hospitalId?: string;
  hospitalName?: string;
  hospitalAddress?: string;
  hospitalPhone?: string;
  startDateTime: string;
  endDateTime: string;
  status: AppointmentStatus;
  reasonForVisit: string;
  patientNotes?: string;
  doctorNotes?: string;
  cancelledBy?: string;
  cancellationReason?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface NotificationItem {
  id: string;
  recipientId: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  referenceId?: string;
  createdAt: string;
}

export interface DashboardStats {
  totalPatients: number;
  totalDoctors: number;
  totalDepartments: number;
  todayAppointmentsCount: number;
  upcomingAppointmentsCount: number;
  totalCompletedAppointments: number;
  totalCancelledAppointments: number;
  appointmentsByStatus: Record<string, number>;
}

export interface PatientProfile {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  role: Role;
  nic?: string;
  gender?: string;
  dateOfBirth?: string;
  bloodGroup?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  address?: string;
  allergies?: string;
  medicalHistory?: string;
}

export interface AuditLogItem {
  id: string;
  actorId: string;
  actorEmail: string;
  action: string;
  resourceType: string;
  resourceId: string;
  outcome: string;
  details: string;
  timestamp: string;
}
