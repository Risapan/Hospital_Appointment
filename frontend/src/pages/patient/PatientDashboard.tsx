import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { appointmentService } from '../../services/appointmentService';
import { Appointment } from '../../types';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { StatCard } from '../../components/common/StatCard';
import { AppointmentCard } from '../../components/appointments/AppointmentCard';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import {
  Calendar,
  Clock,
  CheckCircle,
  Search,
  ArrowRight,
  PlusCircle,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { formatDate, formatTime } from '../../utils/format';

export const PatientDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchAppointments = () => {
    setIsLoading(true);
    appointmentService.getMyAppointments()
      .then(setAppointments)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const upcomingAppointments = appointments.filter(
    (a) => a.status === 'CONFIRMED' && new Date(a.startDateTime) >= new Date()
  );
  const completedAppointments = appointments.filter((a) => a.status === 'COMPLETED');
  const nextAppointment = upcomingAppointments[0];

  return (
    <DashboardLayout
      title={`Welcome back, ${user?.fullName?.split(' ')[0] || 'Patient'}`}
      subtitle="Manage your medical consultations and hospital visits"
      actions={
        <Button
          variant="secondary"
          size="sm"
          leftIcon={<PlusCircle className="w-4 h-4" />}
          onClick={() => navigate('/doctors')}
        >
          Book Consultation
        </Button>
      }
    >
      <div className="space-y-8">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <StatCard
            title="Upcoming Appointments"
            value={upcomingAppointments.length}
            subtitle="Scheduled visits"
            icon={<Calendar className="w-5 h-5" />}
            color="teal"
          />
          <StatCard
            title="Completed Visits"
            value={completedAppointments.length}
            subtitle="Past consultations"
            icon={<CheckCircle className="w-5 h-5" />}
            color="emerald"
          />
          <StatCard
            title="Total Bookings"
            value={appointments.length}
            subtitle="All time records"
            icon={<FileText className="w-5 h-5" />}
            color="navy"
          />
        </div>

        {/* Next Upcoming Appointment Spotlight */}
        {nextAppointment && (
          <div className="bg-gradient-to-r from-navy-950 to-navy-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-teal-400 bg-teal-950/60 border border-teal-800/60 px-3 py-1 rounded-full">
                Next Upcoming Consultation
              </span>
              <h3 className="text-2xl font-black">{nextAppointment.doctorName}</h3>
              <p className="text-xs text-slate-300 font-medium">
                {nextAppointment.doctorSpecialty} • {nextAppointment.departmentName}
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-2">
                <span className="flex items-center gap-1.5 font-bold text-white">
                  <Calendar className="w-4 h-4 text-teal-400" />
                  {formatDate(nextAppointment.startDateTime, { weekday: 'short', day: '2-digit', month: 'short' })}
                </span>
                <span className="flex items-center gap-1.5 font-bold text-white">
                  <Clock className="w-4 h-4 text-teal-400" />
                  {formatTime(nextAppointment.startDateTime)}
                </span>
                {nextAppointment.roomNumber && (
                  <span>Room: {nextAppointment.roomNumber}</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                onClick={() => navigate('/patient/appointments')}
              >
                Manage Appointment
              </Button>
            </div>
          </div>
        )}

        {/* Recent Appointments Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-navy-950">Recent Appointment History</h3>
            <Link
              to="/patient/appointments"
              className="text-xs font-bold text-teal-700 hover:text-teal-800 inline-flex items-center gap-1"
            >
              View Full History <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {isLoading ? (
            <LoadingSpinner message="Retrieving appointments..." />
          ) : appointments.length === 0 ? (
            <EmptyState
              title="No appointments booked yet"
              description="Browse our verified medical specialists and reserve your first hospital consultation today."
              icon={<Calendar className="w-8 h-8" />}
              actionText="Find a Doctor"
              onAction={() => navigate('/doctors')}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {appointments.slice(0, 4).map((apt) => (
                <AppointmentCard
                  key={apt.id}
                  appointment={apt}
                  currentRole="PATIENT"
                  onCancel={() => navigate('/patient/appointments')}
                  onReschedule={() => navigate('/patient/appointments')}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};
