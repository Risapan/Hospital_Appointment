import React, { useState, useEffect } from 'react';
import { Doctor, Hospital as HospitalType, TimeSlot } from '../../types';
import { doctorService } from '../../services/doctorService';
import { appointmentService } from '../../services/appointmentService';
import { hospitalService } from '../../services/hospitalService';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Calendar as CalendarIcon, Clock, CheckCircle2, AlertCircle, User, Hospital, MapPin } from 'lucide-react';
import { colomboDateString, formatLKR, formatTime } from '../../utils/format';

interface BookingModalProps {
  doctor: Doctor | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  // Optional patientId if booked by receptionist
  patientId?: string;
  patientName?: string;
  // Pre-selects a hospital when booking from that hospital's page
  hospitalId?: string;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  doctor,
  isOpen,
  onClose,
  onSuccess,
  patientId,
  patientName,
  hospitalId,
}) => {
  const [selectedHospitalId, setSelectedHospitalId] = useState<string>('');
  const [hospitals, setHospitals] = useState<HospitalType[]>([]);

  // The hospital is the patient's preference, so every hospital is offered
  useEffect(() => {
    if (isOpen) hospitalService.getHospitals().then(setHospitals).catch(() => setHospitals([]));
  }, [isOpen]);
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    // Default to tomorrow or today
    return colomboDateString(1);
  });
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [reason, setReason] = useState<string>('');
  const [patientNotes, setPatientNotes] = useState<string>('');
  const [isLoadingSlots, setIsLoadingSlots] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Each time the window opens, ask for the hospital again (unless we came from a hospital's page)
  useEffect(() => {
    if (doctor && isOpen) {
      setSelectedHospitalId(hospitalId || '');
    }
  }, [doctor, isOpen, hospitalId]);

  const selectedHospital = hospitals.find((h) => h.id === selectedHospitalId) || null;

  // Fetch slots whenever doctor or selectedDate changes
  useEffect(() => {
    if (doctor && selectedDate && isOpen) {
      setIsLoadingSlots(true);
      setErrorMessage(null);
      setSelectedSlot(null);
      doctorService.getDoctorSlots(doctor.id, selectedDate)
        .then((data) => {
          setSlots(data);
        })
        .catch((err) => {
          setErrorMessage(err.response?.data?.message || 'Could not load slots for this date.');
          setSlots([]);
        })
        .finally(() => setIsLoadingSlots(false));
    }
  }, [doctor, selectedDate, isOpen]);

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctor || !selectedSlot) return;
    if (!selectedHospitalId) {
      setErrorMessage('Please choose which hospital you would like to book at.');
      return;
    }
    if (!reason.trim()) {
      setErrorMessage('Please provide a reason for the consultation.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await appointmentService.bookAppointment({
        doctorId: doctor.id,
        departmentId: doctor.departmentId,
        startDateTime: selectedSlot.startDateTime,
        reasonForVisit: reason,
        patientNotes: patientNotes || undefined,
        patientId: patientId || undefined,
        hospitalId: selectedHospitalId,
      });

      setSuccessMessage('Appointment successfully booked!');
      setTimeout(() => {
        setSuccessMessage(null);
        setReason('');
        setPatientNotes('');
        setSelectedSlot(null);
        onSuccess();
        onClose();
      }, 1500);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Failed to book appointment. The slot may have just been taken.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!doctor) return null;

  // Min date for picker: today
  const minDate = colomboDateString();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Book Doctor Appointment"
      description={`Schedule your consultation with ${doctor.fullName}`}
      maxWidth="lg"
    >
      {successMessage ? (
        <div className="py-8 text-center space-y-3">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h4 className="text-lg font-bold text-navy-950">{successMessage}</h4>
          <p className="text-sm text-slate-500">
            {selectedHospital
              ? `Your reservation at ${selectedHospital.name} is confirmed. Details are in your dashboard.`
              : 'A confirmation notification has been sent to your account dashboard.'}
          </p>
        </div>
      ) : (
        <form onSubmit={handleBook} className="space-y-5">
          {/* Doctor Brief Info */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-navy-950">{doctor.fullName}</p>
              <p className="text-xs text-teal-700 font-semibold">{doctor.specialty} • {doctor.departmentName}</p>
              {patientName && (
                <p className="text-xs text-amber-700 font-bold mt-1 flex items-center gap-1">
                  <User className="w-3.5 h-3.5" /> Booking for patient: {patientName}
                </p>
              )}
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 block">Fee</span>
              <span className="text-base font-extrabold text-navy-950">
                {formatLKR(doctor.consultationFee)}
              </span>
            </div>
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Hospital Selector */}
          <div>
            <label className="block text-xs font-bold text-navy-950 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Hospital className="w-4 h-4 text-slate-400" />
              1. Which hospital would you like to book at?
            </label>
            {hospitals.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-500">Loading hospitals...</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {hospitals.map((h) => {
                  const isSelected = h.id === selectedHospitalId;
                  return (
                    <button
                      type="button"
                      key={h.id}
                      onClick={() => setSelectedHospitalId(h.id)}
                      className={`text-left p-3 rounded-xl border transition-all ${
                        isSelected
                          ? 'border-teal-600 bg-teal-50 ring-2 ring-teal-600 ring-offset-1'
                          : 'border-slate-200 bg-white hover:border-teal-500'
                      }`}
                    >
                      <span className={`block text-sm font-bold ${isSelected ? 'text-teal-800' : 'text-navy-950'}`}>{h.name}</span>
                      {h.address && (
                        <span className="mt-0.5 text-[11px] text-slate-500 flex items-start gap-1">
                          <MapPin className="w-3 h-3 shrink-0 mt-0.5" /> {h.address}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {selectedHospitalId ? (
          <>
          {/* Date Selector */}
          <div>
            <label className="block text-xs font-bold text-navy-950 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <CalendarIcon className="w-4 h-4 text-slate-400" />
              2. Select Appointment Date
            </label>
            <input
              type="date"
              min={minDate}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900 bg-white font-medium"
              required
            />
          </div>

          {/* Slots Selector */}
          <div>
            <label className="block text-xs font-bold text-navy-950 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-slate-400" />
              3. Select Available Time Slot
            </label>

            {isLoadingSlots ? (
              <div className="py-8 text-center text-xs text-slate-400">Loading available slots...</div>
            ) : slots.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center text-xs text-slate-500">
                No slots available on this date. The doctor may be off or fully booked. Please choose another date.
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1">
                {slots.map((slot) => {
                  const isSelected = selectedSlot?.startDateTime === slot.startDateTime;
                  return (
                    <button
                      type="button"
                      key={slot.startDateTime}
                      disabled={!slot.available}
                      onClick={() => setSelectedSlot(slot)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold text-center transition-all ${
                        !slot.available
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed line-through'
                          : isSelected
                          ? 'bg-teal-600 text-white shadow-sm ring-2 ring-teal-600 ring-offset-1'
                          : 'bg-white border border-slate-200 text-slate-700 hover:border-teal-500 hover:text-teal-700'
                      }`}
                    >
                      {formatTime(slot.startDateTime)}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Reason for Visit */}
          <div>
            <label className="block text-xs font-bold text-navy-950 uppercase tracking-wider mb-1.5">
              4. Reason for Visit *
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Chest pain follow-up, routine checkup, persistent headache"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900"
              required
            />
          </div>

          {/* Patient Notes */}
          <div>
            <label className="block text-xs font-bold text-navy-950 uppercase tracking-wider mb-1.5">
              Additional Notes (Optional)
            </label>
            <textarea
              value={patientNotes}
              onChange={(e) => setPatientNotes(e.target.value)}
              placeholder="Any symptoms, current medications, or notes for the doctor..."
              rows={2}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900"
            />
          </div>
          </>
          ) : (
            hospitals.length > 0 && (
              <p className="text-xs text-slate-500">Choose a hospital above to see the available dates and times.</p>
            )
          )}

          {/* Form Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button variant="ghost" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="secondary"
              type="submit"
              disabled={!selectedHospitalId || !selectedSlot || !reason.trim() || isSubmitting}
              isLoading={isSubmitting}
            >
              Confirm Appointment
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
