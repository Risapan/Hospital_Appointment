import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { hospitalService } from '../../services/hospitalService';
import { doctorService } from '../../services/doctorService';
import { departmentService } from '../../services/departmentService';
import { appointmentService } from '../../services/appointmentService';
import { useAuth } from '../../contexts/AuthContext';
import { Hospital, Doctor, Department, TimeSlot } from '../../types';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  Hospital as HospitalIcon, MapPin, Search, Check, ChevronLeft, ChevronRight,
  Calendar as CalendarIcon, Clock, AlertCircle, CheckCircle2, Stethoscope,
} from 'lucide-react';
import { colomboDateString, formatDate, formatLKR, formatTime } from '../../utils/format';

/*
 * Booking happens entirely on East Care Point:
 *   1. the patient says which hospital they prefer
 *   2. chooses a doctor
 *   3. picks a date and time
 * and East Care Point makes the reservation at that hospital for them.
 * The step, hospital and doctor live in the URL, so Back/Next and the browser history move between steps.
 */
type Step = 1 | 2 | 3;
const STEP_LABELS = ['Preferred hospital', 'Choose doctor', 'Date & time'];

const Stepper: React.FC<{ step: Step }> = ({ step }) => (
  <ol className="flex flex-wrap items-center gap-2 text-xs font-bold">
    {STEP_LABELS.map((label, i) => {
      const n = (i + 1) as Step;
      const done = n < step;
      const active = n === step;
      return (
        <li key={label} className="flex items-center gap-2">
          <span
            className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
              done ? 'bg-teal-600 text-white' : active ? 'bg-navy-900 text-white' : 'bg-slate-200 text-slate-500'
            }`}
          >
            {done ? <Check className="w-4 h-4" /> : n}
          </span>
          <span className={active ? 'text-navy-950' : done ? 'text-teal-700' : 'text-slate-400'}>{label}</span>
          {n < 3 && <span className="w-8 h-px bg-slate-300" />}
        </li>
      );
    })}
  </ol>
);

export const BookPage: React.FC = () => {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const hospitalId = params.get('hospitalId') || '';
  const doctorId = params.get('doctorId') || '';
  const requestedStep = Number(params.get('step')) || 1;
  // Never show a step whose earlier choices are missing
  const step: Step = !hospitalId ? 1 : requestedStep >= 3 && doctorId ? 3 : requestedStep >= 2 ? 2 : 1;

  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [departmentId, setDepartmentId] = useState<string>('');

  const [date, setDate] = useState<string>(() => colomboDateString(1));
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState<boolean>(false);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [reason, setReason] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [booked, setBooked] = useState<boolean>(false);

  useEffect(() => {
    Promise.all([
      hospitalService.getHospitals(),
      doctorService.getAllDoctors({ activeOnly: true }),
      departmentService.getDepartments(),
    ])
      .then(([h, d, deps]) => {
        setHospitals(h);
        setDoctors(d);
        setDepartments(deps);
      })
      .catch(() => setError("Couldn't load hospitals and doctors. Please check the server is running and try again."))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (step !== 3 || !doctorId || !date) return;
    setSlotsLoading(true);
    setSelectedSlot(null);
    doctorService.getDoctorSlots(doctorId, date)
      .then(setSlots)
      .catch(() => setSlots([]))
      .finally(() => setSlotsLoading(false));
  }, [step, doctorId, date]);

  const hospital = hospitals.find((h) => h.id === hospitalId) || null;
  const doctor = doctors.find((d) => d.id === doctorId) || null;

  // Each change is a new history entry, so browser Back/Forward also step through the booking
  const go = (changes: Record<string, string>) => {
    const next = new URLSearchParams(params);
    Object.entries(changes).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    setParams(next);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goBack = () => go({ step: String(step - 1) });
  const goNext = () => go({ step: String(step + 1) });

  const filteredDoctors = doctors.filter((d) => {
    const q = search.trim().toLowerCase();
    const matchesSearch = !q || d.fullName.toLowerCase().includes(q) || d.specialty.toLowerCase().includes(q);
    return matchesSearch && (!departmentId || d.departmentId === departmentId);
  });

  const handleConfirm = async () => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=${encodeURIComponent(`/book?${params.toString()}`)}`);
      return;
    }
    if (!doctor || !hospital || !selectedSlot) return;
    if (!reason.trim()) {
      setError('Please tell us the reason for your visit.');
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await appointmentService.bookAppointment({
        doctorId: doctor.id,
        departmentId: doctor.departmentId,
        hospitalId: hospital.id,
        startDateTime: selectedSlot.startDateTime,
        reasonForVisit: reason.trim(),
        patientNotes: notes.trim() || undefined,
      });
      setBooked(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not book this time. It may have just been taken. Please choose another.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <LoadingSpinner message="Loading..." />;

  // ---------- Confirmation ----------
  if (booked && doctor && hospital && selectedSlot) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-5">
        <div className="w-16 h-16 mx-auto rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
          <CheckCircle2 className="w-9 h-9" />
        </div>
        <h1 className="text-3xl font-black text-navy-950">Your appointment is booked</h1>
        <div className="bg-white rounded-2xl border border-slate-150 p-6 text-left space-y-2 text-sm">
          <p><span className="text-slate-400 font-semibold">Hospital:</span> <b>{hospital.name}</b></p>
          <p><span className="text-slate-400 font-semibold">Doctor:</span> <b>{doctor.fullName}</b> · {doctor.specialty}</p>
          <p><span className="text-slate-400 font-semibold">When:</span> <b>{formatDate(selectedSlot.startDateTime)}, {formatTime(selectedSlot.startDateTime)}</b></p>
          <p><span className="text-slate-400 font-semibold">Fee:</span> <b>{formatLKR(doctor.consultationFee)}</b> (pay at the hospital)</p>
        </div>
        <p className="text-sm text-slate-500">
          East Care Point will make this reservation at {hospital.name} for you. Please arrive a little before your time.
        </p>
        <div className="flex justify-center gap-3">
          <Button variant="secondary" onClick={() => navigate('/patient/appointments')}>My Appointments</Button>
          <Button variant="outline" onClick={() => { setBooked(false); setParams(new URLSearchParams()); }}>Book another</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="space-y-3">
        <Stepper step={step} />
        <h1 className="text-3xl font-black text-navy-950">
          {step === 1 && 'Which hospital would you like to book through?'}
          {step === 2 && 'Choose your doctor'}
          {step === 3 && 'Choose a date and time'}
        </h1>
        <p className="text-sm text-slate-500">
          Everything is done here on East Care Point. We make the reservation at your preferred hospital for you.
        </p>
      </div>

      {/* Summary of earlier choices */}
      {step > 1 && hospital && (
        <div className="flex flex-wrap gap-3 text-sm">
          <span className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-teal-50 border border-teal-100 text-teal-900 font-semibold">
            <HospitalIcon className="w-4 h-4" /> {hospital.name}
          </span>
          {step > 2 && doctor && (
            <span className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-teal-50 border border-teal-100 text-teal-900 font-semibold">
              <Stethoscope className="w-4 h-4" /> {doctor.fullName} · {formatLKR(doctor.consultationFee)}
            </span>
          )}
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-semibold">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /> {error}
        </div>
      )}

      {/* ---------- Step 1: preferred hospital ---------- */}
      {step === 1 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {hospitals.map((h) => {
            const selected = h.id === hospitalId;
            return (
              <button
                key={h.id}
                type="button"
                onClick={() => go({ hospitalId: h.id })}
                className={`text-left rounded-2xl p-5 border transition-all ${
                  selected
                    ? 'border-teal-600 bg-teal-50 ring-2 ring-teal-600 ring-offset-1'
                    : 'border-slate-200 bg-white hover:border-teal-400 hover:-translate-y-0.5 hover:shadow-md'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${selected ? 'bg-teal-600 text-white' : 'bg-teal-50 text-teal-700'}`}>
                    <HospitalIcon className="w-5 h-5" />
                  </div>
                  {selected && <Check className="w-5 h-5 text-teal-700" />}
                </div>
                <p className="mt-3 font-extrabold text-navy-950">{h.name}</p>
                <p className="text-xs font-semibold text-slate-400">{h.sector} {h.type}</p>
                {h.address && (
                  <p className="mt-2 text-xs text-slate-500 flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" /> {h.address}
                  </p>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* ---------- Step 2: doctor ---------- */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative sm:col-span-2">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search doctor name or specialty..."
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900"
              />
            </div>
            <select
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-navy-900"
            >
              <option value="">All departments</option>
              {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>

          {filteredDoctors.length === 0 ? (
            <p className="text-sm text-slate-500 py-8 text-center">No doctors match your search.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredDoctors.map((d) => {
                const selected = d.id === doctorId;
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => go({ doctorId: d.id })}
                    className={`text-left flex items-center gap-4 rounded-2xl p-4 border transition-all ${
                      selected
                        ? 'border-teal-600 bg-teal-50 ring-2 ring-teal-600 ring-offset-1'
                        : 'border-slate-200 bg-white hover:border-teal-400 hover:shadow-md'
                    }`}
                  >
                    {d.profileImageUrl ? (
                      <img src={d.profileImageUrl} alt={d.fullName} className="w-14 h-14 rounded-xl object-cover shrink-0" />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-navy-50 text-navy-800 font-black text-xl flex items-center justify-center shrink-0">
                        {d.fullName.replace(/^(Dr|Prof)\.\s*/, '').charAt(0)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-extrabold text-navy-950 truncate">{d.fullName}</p>
                      <p className="text-xs text-teal-700 font-semibold truncate">{d.specialty}</p>
                      <p className="text-xs text-slate-400">{d.departmentName}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-black text-navy-950">{formatLKR(d.consultationFee)}</p>
                      {selected && <Check className="w-5 h-5 text-teal-700 ml-auto mt-1" />}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ---------- Step 3: date, time, reason ---------- */}
      {step === 3 && doctor && (
        <div className="bg-white rounded-2xl border border-slate-150 p-6 space-y-5">
          <div>
            <label className="block text-xs font-bold text-navy-950 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <CalendarIcon className="w-4 h-4 text-slate-400" /> Date
            </label>
            <input
              type="date"
              min={colomboDateString()}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full sm:w-64 px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-navy-950 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-slate-400" /> Time
            </label>
            {slotsLoading ? (
              <p className="text-xs text-slate-400 py-4">Loading available times...</p>
            ) : slots.length === 0 ? (
              <p className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-500">
                {doctor.fullName} has no clinic on this date. Please choose another date.
              </p>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {slots.map((slot) => {
                  const selected = selectedSlot?.startDateTime === slot.startDateTime;
                  return (
                    <button
                      key={slot.startDateTime}
                      type="button"
                      disabled={!slot.available}
                      onClick={() => setSelectedSlot(slot)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        !slot.available
                          ? 'bg-slate-100 text-slate-400 line-through cursor-not-allowed'
                          : selected
                          ? 'bg-teal-600 text-white ring-2 ring-teal-600 ring-offset-1'
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-navy-950 uppercase tracking-wider mb-1.5">Reason for visit *</label>
              <input
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Fever, follow-up visit, skin rash"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-navy-950 uppercase tracking-wider mb-1.5">Notes (optional)</label>
              <input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Symptoms, medicines you take..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900"
              />
            </div>
          </div>
          {!isAuthenticated && (
            <p className="text-xs text-amber-700 font-semibold">
              You'll be asked to <Link to="/login" className="underline">log in</Link> when you confirm.
            </p>
          )}
        </div>
      )}

      {/* ---------- Back / Next ---------- */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
        <Button variant="outline" onClick={goBack} disabled={step === 1} leftIcon={<ChevronLeft className="w-4 h-4" />}>
          Back
        </Button>
        {step < 3 ? (
          <Button
            variant="primary"
            onClick={goNext}
            disabled={(step === 1 && !hospitalId) || (step === 2 && !doctorId)}
            rightIcon={<ChevronRight className="w-4 h-4" />}
          >
            Next
          </Button>
        ) : (
          <Button
            variant="secondary"
            onClick={handleConfirm}
            disabled={!selectedSlot || !reason.trim() || isSubmitting}
            isLoading={isSubmitting}
          >
            Confirm booking
          </Button>
        )}
      </div>
    </div>
  );
};
