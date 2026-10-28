import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doctorService } from '../../services/doctorService';
import { Doctor, Availability } from '../../types';
import { BookingModal } from '../../components/appointments/BookingModal';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';
import {
  Calendar,
  Clock,
  MapPin,
  Award,
  ArrowLeft,
  Mail,
  Phone,
  ShieldCheck,
  Star,
  CheckCircle,
} from 'lucide-react';

export const DoctorDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [schedules, setSchedules] = useState<Availability[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isBookingOpen, setIsBookingOpen] = useState<boolean>(false);

  useEffect(() => {
    if (id) {
      setIsLoading(true);
      Promise.all([
        doctorService.getDoctorById(id),
        doctorService.getDoctorSchedules(id).catch(() => []),
      ])
        .then(([doc, sched]) => {
          setDoctor(doc);
          setSchedules(sched);
        })
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  }, [id]);

  if (isLoading) return <LoadingSpinner message="Loading doctor profile..." />;

  if (!doctor) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-navy-950">Doctor Profile Not Found</h2>
        <Button onClick={() => navigate('/doctors')}>Back to Directory</Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <Link
        to="/doctors"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-navy-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Specialists Directory
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Doctor Profile Card */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-3xl p-8 border border-slate-150 shadow-sm flex flex-col sm:flex-row gap-6 items-start">
            <img
              src={doctor.profileImageUrl || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400'}
              alt={doctor.fullName}
              className="w-32 h-32 rounded-2xl object-cover border-2 border-teal-100 shadow-sm shrink-0"
            />
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-100">
                  {doctor.departmentName}
                </span>
                <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  4.9 Rating
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-navy-950">{doctor.fullName}</h1>
              <p className="text-sm font-semibold text-slate-500">{doctor.qualifications}</p>
              <p className="text-sm font-bold text-teal-700">{doctor.specialty}</p>

              <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-slate-500 font-medium">
                {doctor.roomNumber && (
                  <span className="flex items-center gap-1"><MapPin className="w-4 h-4 text-slate-400" /> Room {doctor.roomNumber}</span>
                )}
                <span className="flex items-center gap-1"><Award className="w-4 h-4 text-slate-400" /> {doctor.experienceYears} Years Clinical Exp</span>
              </div>
            </div>
          </div>

          {/* Biography */}
          <div className="bg-white rounded-3xl p-8 border border-slate-150 shadow-sm space-y-4">
            <h3 className="text-lg font-extrabold text-navy-950">Professional Biography</h3>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {doctor.biography || 'Specialist practicing at CarePoint Hospital offering advanced medical consultation and patient care.'}
            </p>
          </div>

          {/* Regular Working Hours */}
          <div className="bg-white rounded-3xl p-8 border border-slate-150 shadow-sm space-y-4">
            <h3 className="text-lg font-extrabold text-navy-950">Standard Clinical Hours</h3>
            {schedules.length === 0 ? (
              <p className="text-xs text-slate-500">Regular hours configured: Monday - Friday, 09:00 AM - 05:00 PM</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {schedules.map((s) => (
                  <div key={s.id || s.dayOfWeek} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                    <span className="font-bold text-navy-900 block">{s.dayOfWeek}</span>
                    <span className="text-slate-500 font-medium">{s.startTime.slice(0, 5)} - {s.endTime.slice(0, 5)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Appointment Booking CTA Card */}
        <div className="lg:col-span-4">
          <div className="sticky top-24 bg-white rounded-3xl p-6 border border-slate-150 shadow-lg space-y-6">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Consultation Fee</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-black text-navy-950">
                  ${doctor.consultationFee ? doctor.consultationFee.toFixed(2) : '50.00'}
                </span>
                <span className="text-xs text-slate-400">/ 30 min session</span>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-100 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Confirmed live reservation</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-teal-600" />
                <span>Zero wait clinic admission</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-navy-800" />
                <span>Private & secure health records</span>
              </div>
            </div>

            <Button
              variant="secondary"
              className="w-full py-3"
              leftIcon={<Calendar className="w-4 h-4" />}
              onClick={() => {
                if (!isAuthenticated) {
                  navigate(`/login?redirect=/doctors/${doctor.id}`);
                } else {
                  setIsBookingOpen(true);
                }
              }}
            >
              Book an Appointment
            </Button>
          </div>
        </div>
      </div>

      <BookingModal
        doctor={doctor}
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        onSuccess={() => navigate('/patient/appointments')}
      />
    </div>
  );
};
