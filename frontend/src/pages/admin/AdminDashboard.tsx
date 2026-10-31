import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { DashboardStats, Appointment, AuditLogItem } from '../../types';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { StatCard } from '../../components/common/StatCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Badge } from '../../components/common/Badge';
import {
  Users,
  Building2,
  Calendar,
  CheckCircle,
  XCircle,
  Activity,
  Shield,
  FileText,
  Clock,
} from 'lucide-react';
import { formatDate, formatTime } from '../../utils/format';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentAppointments, setRecentAppointments] = useState<Appointment[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      adminService.getDashboardStats(),
      adminService.getAllAppointments(),
      adminService.getAuditLogs().catch(() => []),
    ])
      .then(([st, apts, logs]) => {
        setStats(st);
        setRecentAppointments(apts.slice(0, 5));
        setAuditLogs(logs.slice(0, 6));
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <LoadingSpinner message="Calculating hospital operations data..." />;

  return (
    <DashboardLayout
      title="Hospital Operational Analytics"
      subtitle="Executive administrative overview of clinical staff, patient registrations, and appointments"
    >
      <div className="space-y-8">
        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Patients"
            value={stats?.totalPatients || 0}
            subtitle="Registered active accounts"
            icon={<Users className="w-5 h-5" />}
            color="navy"
          />
          <StatCard
            title="Active Physicians"
            value={stats?.totalDoctors || 0}
            subtitle="Verified specialists"
            icon={<Shield className="w-5 h-5" />}
            color="teal"
          />
          <StatCard
            title="Departments"
            value={stats?.totalDepartments || 0}
            subtitle="Clinical specialties"
            icon={<Building2 className="w-5 h-5" />}
            color="emerald"
          />
          <StatCard
            title="Today's Consultations"
            value={stats?.todayAppointmentsCount || 0}
            subtitle="Scheduled visits today"
            icon={<Calendar className="w-5 h-5" />}
            color="amber"
          />
        </div>

        {/* Appointment Status Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-150 shadow-sm lg:col-span-1 space-y-4">
            <h3 className="text-base font-extrabold text-navy-950 flex items-center gap-2">
              <Activity className="w-5 h-5 text-teal-600" /> Appointment Status Ratio
            </h3>
            <div className="space-y-3 pt-2">
              {stats?.appointmentsByStatus &&
                Object.entries(stats.appointmentsByStatus).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                    <span className="font-bold text-navy-950 uppercase">{status}</span>
                    <span className="font-black text-sm text-teal-800">{count}</span>
                  </div>
                ))}
            </div>
          </div>

          {/* Recent Appointments Table */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-150 shadow-sm lg:col-span-2 space-y-4">
            <h3 className="text-base font-extrabold text-navy-950 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-navy-900" /> Recent Booking Activity
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-150 text-slate-400 uppercase tracking-wider">
                    <th className="pb-3 font-bold">Patient</th>
                    <th className="pb-3 font-bold">Doctor</th>
                    <th className="pb-3 font-bold">Scheduled Time</th>
                    <th className="pb-3 font-bold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {recentAppointments.map((apt) => (
                    <tr key={apt.id} className="hover:bg-slate-50/60">
                      <td className="py-3 font-bold text-navy-950">{apt.patientName}</td>
                      <td className="py-3">{apt.doctorName}</td>
                      <td className="py-3 text-slate-500">
                        {formatDate(apt.startDateTime, { day: '2-digit', month: 'short', year: 'numeric' })} {formatTime(apt.startDateTime)}
                      </td>
                      <td className="py-3 text-right">
                        <Badge status={apt.status} size="sm">{apt.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Audit Log Snippet */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-150 shadow-sm space-y-4">
          <h3 className="text-base font-extrabold text-navy-950 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" /> Latest System Security Audit Trail
          </h3>
          <div className="divide-y divide-slate-100 text-xs">
            {auditLogs.map((log) => (
              <div key={log.id} className="py-3 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-navy-950">{log.action}</span>
                    <span className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded">
                      {log.resourceType}
                    </span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${log.outcome === 'SUCCESS' ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'}`}>
                      {log.outcome}
                    </span>
                  </div>
                  <p className="text-slate-500">{log.details}</p>
                </div>
                <div className="text-right text-[11px] text-slate-400 shrink-0">
                  <Clock className="w-3 h-3 inline mr-1" />
                  {formatTime(log.timestamp)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
