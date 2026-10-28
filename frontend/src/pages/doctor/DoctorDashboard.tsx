import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { appointmentService } from '../../services/appointmentService';
import { doctorService } from '../../services/doctorService';
import { Appointment, Doctor } from '../../types';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { StatCard } from '../../components/common/StatCard';
import { AppointmentCard } from '../../components/appointments/AppointmentCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { Button } from '../../components/common/Button';
import { Calendar, Clock, CheckCircle, Users, Award, AlertCircle } from 'lucide-react';

export const DoctorDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [profile, setProfile] = useState<Doctor | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      appointmentService.getDoctorAppointments(),
      doctorService.getMyProfile().catch(() => null),
    ])
      .then(([apts, prof]) => {
        setAppointments(apts);
        setProfile(prof);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const todayStr = new Date().toLocaleDateString('en-CA');
  const todayAppointments = appointments.filter(
    (a) => a.startDateTime.startsWith(todayStr) && a.status === 'CONFIRMED'
  );
  const upcomingAppointments = appointments.filter(
    (a) => a.status === 'CONFIRMED' && new Date(a.startDateTime) >= new Date()
  );
  const completedCount = appointments.filter((a) => a.status === 'COMPLETED').length;

  return (
    <DashboardLayout
      title={`Clinical Dashboard — ${user?.fullName}`}
      subtitle="View your daily consultation agenda, patient notes, and clinical availability"
      actions={
        <Button
          variant="outline"
          size="sm"
          leftIcon={<Clock className="w-4 h-4" />}
          onClick={() => navigate('/doctor/schedule')}
        >
          Manage Working Hours
        </Button>
      }
    >
      <div className="space-y-8">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <StatCard
            title="Today's Consultations"
            value={todayAppointments.length}
            subtitle="Scheduled for today"
            icon={<Calendar className="w-5 h-5" />}
            color="teal"
          />
          <StatCard
            title="Upcoming Patients"
            value={upcomingAppointments.length}
            subtitle="Future bookings"
            icon={<Users className="w-5 h-5" />}
            color="navy"
          />
          <StatCard
            title="Completed Visits"
            value={completedCount}
            subtitle="Consultations finalized"
            icon={<CheckCircle className="w-5 h-5" />}
            color="emerald"
          />
        </div>

        {/* Today's Agenda Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-navy-950">Today's Patient Schedule</h3>
            <span className="text-xs font-bold text-slate-400">
              {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>

          {isLoading ? (
            <LoadingSpinner message="Loading doctor dashboard..." />
          ) : todayAppointments.length === 0 ? (
            <div className="p-8 bg-white rounded-3xl border border-slate-150 text-center space-y-2">
              <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto" />
              <h4 className="text-sm font-bold text-navy-950">No remaining consultations today</h4>
              <p className="text-xs text-slate-500">You are completely caught up for today's OPD session.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {todayAppointments.map((apt) => (
                <AppointmentCard
                  key={apt.id}
                  appointment={apt}
                  currentRole="DOCTOR"
                  onUpdateStatus={() => navigate('/doctor/appointments')}
                />
              ))}
            </div>
          )}
        </div>

        {/* All Upcoming Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-black text-navy-950">Upcoming Appointments</h3>
          {upcomingAppointments.length === 0 ? (
            <EmptyState
              title="No upcoming bookings"
              description="New patient bookings will appear here as soon as they reserve slots on your schedule."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {upcomingAppointments.slice(0, 4).map((apt) => (
                <AppointmentCard
                  key={apt.id}
                  appointment={apt}
                  currentRole="DOCTOR"
                  onUpdateStatus={() => navigate('/doctor/appointments')}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};
