import React, { useState, useEffect } from 'react';
import { appointmentService } from '../../services/appointmentService';
import { Appointment, AppointmentStatus } from '../../types';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { AppointmentCard } from '../../components/appointments/AppointmentCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { Calendar, Search, Filter } from 'lucide-react';

export const DoctorAppointmentsPage: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Status update modal
  const [updatingAppointment, setUpdatingAppointment] = useState<Appointment | null>(null);
  const [targetStatus, setTargetStatus] = useState<AppointmentStatus>('COMPLETED');
  const [doctorNotes, setDoctorNotes] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  const fetchAppointments = () => {
    setIsLoading(true);
    appointmentService.getDoctorAppointments()
      .then(setAppointments)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleOpenStatusModal = (apt: Appointment, status: AppointmentStatus) => {
    setUpdatingAppointment(apt);
    setTargetStatus(status);
    setDoctorNotes(apt.doctorNotes || '');
  };

  const handleConfirmStatusUpdate = async () => {
    if (!updatingAppointment) return;
    setIsUpdating(true);
    try {
      await appointmentService.updateDoctorAppointmentStatus(
        updatingAppointment.id,
        targetStatus,
        doctorNotes
      );
      setUpdatingAppointment(null);
      fetchAppointments();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredAppointments = appointments.filter((apt) => {
    const matchesSearch =
      !search ||
      apt.patientName.toLowerCase().includes(search.toLowerCase()) ||
      apt.reasonForVisit.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || apt.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout
      title="Appointment Management"
      subtitle="Review patient appointments, record consultation notes, and update attendance"
    >
      <div className="space-y-6">
        {/* Search & Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-150 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by patient name..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
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

        {/* Appointment Grid */}
        {isLoading ? (
          <LoadingSpinner message="Loading patient list..." />
        ) : filteredAppointments.length === 0 ? (
          <EmptyState
            title="No appointments found"
            description="No consultations matched your search criteria."
            icon={<Calendar className="w-8 h-8" />}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAppointments.map((apt) => (
              <AppointmentCard
                key={apt.id}
                appointment={apt}
                currentRole="DOCTOR"
                onUpdateStatus={(a, st) => handleOpenStatusModal(a, st)}
                onCancel={(a) => handleOpenStatusModal(a, 'CANCELLED')}
              />
            ))}
          </div>
        )}
      </div>

      {/* Status Update Modal */}
      <Modal
        isOpen={!!updatingAppointment}
        onClose={() => setUpdatingAppointment(null)}
        title={`Update Appointment Status: ${targetStatus}`}
        description={`Record notes and set outcome for ${updatingAppointment?.patientName}`}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-navy-950 uppercase mb-1.5">
              Doctor Clinical Notes & Recommendations
            </label>
            <textarea
              value={doctorNotes}
              onChange={(e) => setDoctorNotes(e.target.value)}
              placeholder="e.g. Prescribed medication, follow-up in 2 weeks, patient stable..."
              rows={3}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="ghost" onClick={() => setUpdatingAppointment(null)}>
              Cancel
            </Button>
            <Button
              variant={targetStatus === 'CANCELLED' ? 'danger' : 'secondary'}
              onClick={handleConfirmStatusUpdate}
              isLoading={isUpdating}
            >
              Confirm Status: {targetStatus}
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
};
