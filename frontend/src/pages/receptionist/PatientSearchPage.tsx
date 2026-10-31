import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { receptionistService } from '../../services/receptionistService';
import { doctorService } from '../../services/doctorService';
import { UserSummary, Doctor } from '../../types';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { BookingModal } from '../../components/appointments/BookingModal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Search, UserPlus, Calendar, Phone, Mail, User } from 'lucide-react';
import { formatLKR } from '../../utils/format';

export const PatientSearchPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [patients, setPatients] = useState<UserSummary[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Walk-in Registration Modal
  const [isRegisterOpen, setIsRegisterOpen] = useState(searchParams.get('new') === 'true');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  // Booking for patient modal
  const [bookingForPatient, setBookingForPatient] = useState<UserSummary | null>(null);
  const [selectedDoctorForBooking, setSelectedDoctorForBooking] = useState<Doctor | null>(null);

  const fetchPatients = (q?: string) => {
    setIsLoading(true);
    receptionistService.searchPatients(q)
      .then(setPatients)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchPatients(search);
    doctorService.getAllDoctors().then(setDoctors).catch(console.error);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPatients(search);
  };

  const handleRegisterWalkIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRegistering(true);
    try {
      const created = await receptionistService.registerWalkIn({
        fullName,
        email,
        phoneNumber,
      });
      setIsRegisterOpen(false);
      setFullName('');
      setEmail('');
      setPhoneNumber('');
      fetchPatients();
      // Directly prompt to book for newly registered patient
      setBookingForPatient(created);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to register walk-in patient');
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <DashboardLayout
      title="Patient Search & Walk-In Intake"
      subtitle="Lookup existing patient medical files or register walk-in patients on the spot"
      actions={
        <Button
          variant="secondary"
          size="sm"
          leftIcon={<UserPlus className="w-4 h-4" />}
          onClick={() => setIsRegisterOpen(true)}
        >
          Register Walk-In Patient
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="bg-white p-4 rounded-2xl border border-slate-150 flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by patient name, phone number, or email..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900"
            />
          </div>
          <Button type="submit" variant="primary">
            Search
          </Button>
        </form>

        {/* Patients Grid / Table */}
        {isLoading ? (
          <LoadingSpinner message="Searching registered patients..." />
        ) : (
          <div className="bg-white rounded-3xl border border-slate-150 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-150 text-slate-400 uppercase tracking-wider font-bold">
                  <tr>
                    <th className="py-3.5 px-6">Patient</th>
                    <th className="py-3.5 px-6">Contact Info</th>
                    <th className="py-3.5 px-6">Patient ID</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {patients.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/50">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-800 font-bold flex items-center justify-center text-sm border border-teal-100">
                            {p.fullName.charAt(0)}
                          </div>
                          <div>
                            <span className="font-extrabold text-navy-950 text-sm block">{p.fullName}</span>
                            <span className="text-[11px] text-slate-400">{p.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-slate-600 block">{p.phoneNumber || 'No phone recorded'}</span>
                      </td>
                      <td className="py-4 px-6 font-mono text-slate-400 text-[11px]">
                        #{p.id.slice(-8)}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Button
                          variant="secondary"
                          size="sm"
                          leftIcon={<Calendar className="w-3.5 h-3.5" />}
                          onClick={() => setBookingForPatient(p)}
                        >
                          Book Appointment
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Walk-in Registration Modal */}
      <Modal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        title="Walk-In Patient Intake"
        description="Register a new walk-in patient directly into the hospital system"
      >
        <form onSubmit={handleRegisterWalkIn} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-navy-950 uppercase mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Nimal Bandara"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-navy-950 uppercase mb-1">Email Address *</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nimal.bandara@example.lk"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-navy-950 uppercase mb-1">Phone Number</label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+94 77 000 0000"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="ghost" type="button" onClick={() => setIsRegisterOpen(false)}>
              Cancel
            </Button>
            <Button variant="secondary" type="submit" isLoading={isRegistering}>
              Register Patient
            </Button>
          </div>
        </form>
      </Modal>

      {/* Select Doctor Modal for Receptionist */}
      <Modal
        isOpen={!!bookingForPatient && !selectedDoctorForBooking}
        onClose={() => setBookingForPatient(null)}
        title={`Select Doctor for ${bookingForPatient?.fullName}`}
        description="Choose a physician or specialist to schedule the consultation"
        maxWidth="lg"
      >
        <div className="space-y-3 max-h-96 overflow-y-auto p-1">
          {doctors.map((doc) => (
            <div
              key={doc.id}
              onClick={() => setSelectedDoctorForBooking(doc)}
              className="p-4 bg-slate-50 hover:bg-teal-50/50 rounded-2xl border border-slate-200 hover:border-teal-300 transition-all cursor-pointer flex items-center justify-between"
            >
              <div>
                <h4 className="font-extrabold text-navy-950 text-sm">{doc.fullName}</h4>
                <p className="text-xs text-teal-700 font-semibold">{doc.specialty} • {doc.departmentName}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{doc.qualifications}</p>
              </div>
              <div className="text-right">
                <span className="text-sm font-black text-navy-950">{formatLKR(doc.consultationFee)}</span>
                <span className="block text-[10px] text-teal-600 font-bold">Select Doctor →</span>
              </div>
            </div>
          ))}
        </div>
      </Modal>

      {/* Slot Booking Modal with patientId */}
      <BookingModal
        doctor={selectedDoctorForBooking}
        isOpen={!!selectedDoctorForBooking}
        onClose={() => {
          setSelectedDoctorForBooking(null);
          setBookingForPatient(null);
        }}
        onSuccess={() => {
          setSelectedDoctorForBooking(null);
          setBookingForPatient(null);
          alert('Appointment booked successfully by front desk!');
        }}
        patientId={bookingForPatient?.id}
        patientName={bookingForPatient?.fullName}
      />
    </DashboardLayout>
  );
};
