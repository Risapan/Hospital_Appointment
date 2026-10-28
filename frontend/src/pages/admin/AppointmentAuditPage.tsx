import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { Appointment } from '../../types';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Search, Calendar, Filter } from 'lucide-react';

export const AppointmentAuditPage: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  useEffect(() => {
    setIsLoading(true);
    adminService.getAllAppointments()
      .then(setAppointments)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const filtered = appointments.filter((a) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      a.patientName.toLowerCase().includes(q) ||
      a.doctorName.toLowerCase().includes(q) ||
      a.departmentName.toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'ALL' || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout
      title="Appointment Records & Audit"
      subtitle="Complete ledger of all patient reservations, cancellations, and doctor outcomes"
    >
      <div className="space-y-6">
        <div className="bg-white p-4 rounded-2xl border border-slate-150 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by patient, doctor, or department..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-navy-900 bg-white"
            >
              <option value="ALL">All Statuses</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="NO_SHOW">No Show</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <LoadingSpinner message="Auditing appointments..." />
        ) : (
          <div className="bg-white rounded-3xl border border-slate-150 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-150 text-slate-400 uppercase tracking-wider font-bold">
                  <tr>
                    <th className="py-3.5 px-6">ID & Patient</th>
                    <th className="py-3.5 px-6">Doctor / Dept</th>
                    <th className="py-3.5 px-6">Date & Time</th>
                    <th className="py-3.5 px-6">Reason</th>
                    <th className="py-3.5 px-6">Status</th>
                    <th className="py-3.5 px-6">Notes / Cancel Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filtered.map((apt) => (
                    <tr key={apt.id} className="hover:bg-slate-50/50">
                      <td className="py-4 px-6">
                        <span className="text-[10px] text-slate-400 font-bold block">#{apt.id.slice(-6)}</span>
                        <span className="font-extrabold text-navy-950 text-sm">{apt.patientName}</span>
                        <span className="text-[11px] text-slate-400 block">{apt.patientPhone || apt.patientEmail}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-bold text-navy-900 block">{apt.doctorName}</span>
                        <span className="text-[11px] text-teal-700 font-semibold">{apt.departmentName}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-bold text-navy-900 block">{new Date(apt.startDateTime).toLocaleDateString()}</span>
                        <span className="text-[11px] text-slate-400">{new Date(apt.startDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </td>
                      <td className="py-4 px-6 max-w-xs truncate">{apt.reasonForVisit}</td>
                      <td className="py-4 px-6">
                        <Badge status={apt.status} size="sm">{apt.status}</Badge>
                      </td>
                      <td className="py-4 px-6 text-slate-500 italic text-[11px] max-w-xs">
                        {apt.cancellationReason ? `Cancelled: ${apt.cancellationReason}` : apt.doctorNotes || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
