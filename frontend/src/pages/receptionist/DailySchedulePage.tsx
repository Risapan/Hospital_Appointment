import React, { useState, useEffect } from 'react';
import { receptionistService } from '../../services/receptionistService';
import { Appointment } from '../../types';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Calendar, Clock, MapPin, Printer } from 'lucide-react';
import { colomboDateString, formatTime } from '../../utils/format';

export const DailySchedulePage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>(
    colomboDateString()
  );
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    setIsLoading(true);
    receptionistService.getDailySchedule(selectedDate)
      .then(setAppointments)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [selectedDate]);

  return (
    <DashboardLayout
      title="Daily Clinical OPD Schedule"
      subtitle="Complete chronological timeline of patient arrivals and doctor consultations"
    >
      <div className="space-y-6">
        {/* Date Selector */}
        <div className="bg-white p-4 rounded-2xl border border-slate-150 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-navy-950 uppercase">Select Schedule Date:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-navy-900 bg-white"
            />
          </div>

          <span className="text-xs font-bold text-slate-400">
            Total for Day: {appointments.length} Consultations
          </span>
        </div>

        {/* Timeline Table */}
        {isLoading ? (
          <LoadingSpinner message="Loading daily schedule..." />
        ) : appointments.length === 0 ? (
          <div className="p-12 bg-white rounded-3xl border border-slate-150 text-center space-y-2">
            <Calendar className="w-8 h-8 text-slate-300 mx-auto" />
            <h4 className="text-sm font-bold text-navy-950">No appointments scheduled for this date</h4>
            <p className="text-xs text-slate-500">Pick another date to view the scheduled appointments timeline.</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-150 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-150 text-slate-400 uppercase tracking-wider font-bold">
                  <tr>
                    <th className="py-3.5 px-6">Time Slot</th>
                    <th className="py-3.5 px-6">Patient</th>
                    <th className="py-3.5 px-6">Doctor & Department</th>
                    <th className="py-3.5 px-6">Location</th>
                    <th className="py-3.5 px-6">Reason for Visit</th>
                    <th className="py-3.5 px-6 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {appointments.map((apt) => (
                    <tr key={apt.id} className="hover:bg-slate-50/50">
                      <td className="py-4 px-6 whitespace-nowrap">
                        <span className="font-extrabold text-navy-950 text-sm block">
                          {formatTime(apt.startDateTime)}
                        </span>
                        <span className="text-[10px] text-slate-400">30 min slot</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-extrabold text-navy-950 text-sm block">{apt.patientName}</span>
                        <span className="text-[11px] text-slate-400">{apt.patientPhone || apt.patientEmail}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-bold text-navy-900 block">{apt.doctorName}</span>
                        <span className="text-[11px] text-teal-700 font-semibold">{apt.departmentName}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-slate-600 font-semibold">
                          {apt.roomNumber ? apt.roomNumber : 'General OPD'}
                        </span>
                      </td>
                      <td className="py-4 px-6 max-w-xs truncate">{apt.reasonForVisit}</td>
                      <td className="py-4 px-6 text-right">
                        <Badge status={apt.status} size="sm">{apt.status}</Badge>
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
