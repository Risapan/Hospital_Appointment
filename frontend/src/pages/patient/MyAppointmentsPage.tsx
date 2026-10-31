import React, { useState, useEffect } from 'react';
import { appointmentService } from '../../services/appointmentService';
import { doctorService } from '../../services/doctorService';
import { Appointment, TimeSlot } from '../../types';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { AppointmentCard } from '../../components/appointments/AppointmentCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { Calendar, AlertCircle } from 'lucide-react';
import { colomboDateString, formatTime } from '../../utils/format';

export const MyAppointmentsPage: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [activeTab, setActiveTab] = useState<'ALL' | 'UPCOMING' | 'COMPLETED' | 'CANCELLED'>('UPCOMING');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Cancellation state
  const [cancellingAppointment, setCancellingAppointment] = useState<Appointment | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('');
  const [isCancelling, setIsCancelling] = useState<boolean>(false);

  // Reschedule state
  const [reschedulingAppointment, setReschedulingAppointment] = useState<Appointment | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState<string>(() => {
    return colomboDateString(1);
  });
  const [rescheduleSlots, setRescheduleSlots] = useState<TimeSlot[]>([]);
  const [selectedRescheduleSlot, setSelectedRescheduleSlot] = useState<TimeSlot | null>(null);
  const [rescheduleReason, setRescheduleReason] = useState<string>('');
  const [isLoadingSlots, setIsLoadingSlots] = useState<boolean>(false);
  const [isRescheduling, setIsRescheduling] = useState<boolean>(false);
  const [rescheduleError, setRescheduleError] = useState<string | null>(null);

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

  // Fetch slots for reschedule
  useEffect(() => {
    if (reschedulingAppointment && rescheduleDate) {
      setIsLoadingSlots(true);
      setRescheduleError(null);
      setSelectedRescheduleSlot(null);
      doctorService.getDoctorSlots(reschedulingAppointment.doctorId, rescheduleDate)
        .then(setRescheduleSlots)
        .catch((err) => {
          setRescheduleError(err.response?.data?.message || 'Could not load slots.');
          setRescheduleSlots([]);
        })
        .finally(() => setIsLoadingSlots(false));
    }
  }, [reschedulingAppointment, rescheduleDate]);

  const handleConfirmCancel = async () => {
    if (!cancellingAppointment) return;
    setIsCancelling(true);
    try {
      await appointmentService.cancelAppointment(cancellingAppointment.id, cancelReason);
      setCancellingAppointment(null);
      setCancelReason('');
      fetchAppointments();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to cancel appointment');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleConfirmReschedule = async () => {
    if (!reschedulingAppointment || !selectedRescheduleSlot) return;
    setIsRescheduling(true);
    setRescheduleError(null);
    try {
      await appointmentService.rescheduleAppointment(
        reschedulingAppointment.id,
        selectedRescheduleSlot.startDateTime,
        rescheduleReason || 'Patient requested reschedule'
      );
      setReschedulingAppointment(null);
      fetchAppointments();
    } catch (err: any) {
      setRescheduleError(err.response?.data?.message || 'Failed to reschedule appointment');
    } finally {
      setIsRescheduling(false);
    }
  };

  const filteredAppointments = appointments.filter((apt) => {
    const isPast = new Date(apt.startDateTime) < new Date();
    if (activeTab === 'UPCOMING') return apt.status === 'CONFIRMED' && !isPast;
    if (activeTab === 'COMPLETED') return apt.status === 'COMPLETED';
    if (activeTab === 'CANCELLED') return apt.status === 'CANCELLED';
    return true;
  });

  return (
    <DashboardLayout
      title="My Appointments"
      subtitle="View, reschedule, or cancel your hospital consultations"
    >
      <div className="space-y-6">
        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 gap-6 text-sm font-bold">
          {(['UPCOMING', 'ALL', 'COMPLETED', 'CANCELLED'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 px-1 border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-teal-600 text-teal-700 font-extrabold'
                  : 'border-transparent text-slate-500 hover:text-navy-950'
              }`}
            >
              {tab.charAt(0) + tab.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* List */}
        {isLoading ? (
          <LoadingSpinner message="Loading your appointments..." />
        ) : filteredAppointments.length === 0 ? (
          <EmptyState
            title={`No ${activeTab.toLowerCase()} appointments found`}
            description="You currently have no consultations matching this category."
            icon={<Calendar className="w-8 h-8" />}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAppointments.map((apt) => (
              <AppointmentCard
                key={apt.id}
                appointment={apt}
                currentRole="PATIENT"
                onCancel={(a) => setCancellingAppointment(a)}
                onReschedule={(a) => setReschedulingAppointment(a)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Cancellation Modal */}
      <Modal
        isOpen={!!cancellingAppointment}
        onClose={() => setCancellingAppointment(null)}
        title="Cancel Appointment"
        description="Are you sure you want to cancel this scheduled consultation? The reserved slot will be released."
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-navy-950 uppercase mb-1.5">
              Reason for Cancellation
            </label>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="e.g. Personal emergency, recovered, conflicts"
              rows={3}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="ghost" onClick={() => setCancellingAppointment(null)}>
              Keep Appointment
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmCancel}
              isLoading={isCancelling}
            >
              Confirm Cancellation
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reschedule Modal */}
      <Modal
        isOpen={!!reschedulingAppointment}
        onClose={() => setReschedulingAppointment(null)}
        title="Reschedule Appointment"
        description="Choose a new date and available time slot for your consultation."
      >
        <div className="space-y-4">
          {rescheduleError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{rescheduleError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-navy-950 uppercase mb-1.5">
              Select New Date
            </label>
            <input
              type="date"
              min={colomboDateString()}
              value={rescheduleDate}
              onChange={(e) => setRescheduleDate(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-navy-950 uppercase mb-1.5">
              Select New Time Slot
            </label>
            {isLoadingSlots ? (
              <p className="text-xs text-slate-400 py-4 text-center">Loading slots...</p>
            ) : rescheduleSlots.length === 0 ? (
              <p className="text-xs text-slate-500 py-3 text-center bg-slate-50 rounded-xl">No slots available on this date.</p>
            ) : (
              <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto p-1">
                {rescheduleSlots.map((slot) => (
                  <button
                    key={slot.startDateTime}
                    type="button"
                    disabled={!slot.available}
                    onClick={() => setSelectedRescheduleSlot(slot)}
                    className={`px-2.5 py-2 rounded-xl text-xs font-semibold ${
                      !slot.available
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed line-through'
                        : selectedRescheduleSlot?.startDateTime === slot.startDateTime
                        ? 'bg-teal-600 text-white'
                        : 'bg-white border border-slate-200 text-slate-700 hover:border-teal-500'
                    }`}
                  >
                    {formatTime(slot.startDateTime)}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="ghost" onClick={() => setReschedulingAppointment(null)}>
              Cancel
            </Button>
            <Button
              variant="secondary"
              disabled={!selectedRescheduleSlot || isRescheduling}
              isLoading={isRescheduling}
              onClick={handleConfirmReschedule}
            >
              Update Appointment
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
};
