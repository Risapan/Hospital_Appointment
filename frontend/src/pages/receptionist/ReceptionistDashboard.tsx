import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { receptionistService } from '../../services/receptionistService';
import { Appointment } from '../../types';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { StatCard } from '../../components/common/StatCard';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Badge } from '../../components/common/Badge';
import { Calendar, Users, UserPlus, Clock, Search, ArrowRight } from 'lucide-react';

export const ReceptionistDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    setIsLoading(true);
    receptionistService.getDailySchedule()
      .then(setTodayAppointments)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const confirmedCount = todayAppointments.filter((a) => a.status === 'CONFIRMED').length;
  const completedCount = todayAppointments.filter((a) => a.status === 'COMPLETED').length;

  return (
    <DashboardLayout
      title="Front Desk & Reception Desk"
      subtitle="Walk-in registration, patient admission triage, and daily OPD schedules"
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<UserPlus className="w-4 h-4" />}
            onClick={() => navigate('/receptionist/patients?new=true')}
          >
            Register Walk-in
          </Button>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Search className="w-4 h-4" />}
            onClick={() => navigate('/receptionist/patients')}
          >
            Find Patient
          </Button>
        </div>
      }
    >
      <div className="space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <StatCard
            title="Today's Appointments"
            value={todayAppointments.length}
            subtitle="Scheduled patients"
            icon={<Calendar className="w-5 h-5" />}
            color="navy"
          />
          <StatCard
            title="Active / Waiting"
            value={confirmedCount}
            subtitle="Awaiting consult"
            icon={<Clock className="w-5 h-5" />}
            color="amber"
          />
          <StatCard
            title="Completed Visits"
            value={completedCount}
            subtitle="Patients seen today"
            icon={<Users className="w-5 h-5" />}
            color="emerald"
          />
        </div>

        {/* Today's Schedule Overview */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-150 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-navy-950">Today's Appointment Schedule</h3>
              <p className="text-xs text-slate-500 mt-0.5">Real-time clinical stream for all hospital departments</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              onClick={() => navigate('/receptionist/daily-schedule')}
            >
              Full Schedule View
            </Button>
          </div>

          {isLoading ? (
            <LoadingSpinner message="Loading front desk schedule..." />
          ) : todayAppointments.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs bg-slate-50 rounded-2xl">
              No appointments scheduled for today yet. Use "Find Patient" to book for walk-ins.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-150 text-slate-400 uppercase tracking-wider font-bold">
                  <tr>
                    <th className="py-3 px-4">Time</th>
                    <th className="py-3 px-4">Patient</th>
                    <th className="py-3 px-4">Doctor</th>
                    <th className="py-3 px-4">Department / Room</th>
                    <th className="py-3 px-4">Reason</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {todayAppointments.map((apt) => (
                    <tr key={apt.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-bold text-navy-950 whitespace-nowrap">
                        {new Date(apt.startDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-extrabold text-navy-950 block">{apt.patientName}</span>
                        <span className="text-[11px] text-slate-400">{apt.patientPhone}</span>
                      </td>
                      <td className="py-3 px-4 font-bold text-navy-900">{apt.doctorName}</td>
                      <td className="py-3 px-4 text-slate-600">
                        {apt.departmentName} {apt.roomNumber ? `• Rm ${apt.roomNumber}` : ''}
                      </td>
                      <td className="py-3 px-4 max-w-xs truncate">{apt.reasonForVisit}</td>
                      <td className="py-3 px-4 text-right">
                        <Badge status={apt.status} size="sm">{apt.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};
