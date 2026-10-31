import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { hospitalService } from '../../services/hospitalService';
import { doctorService } from '../../services/doctorService';
import { Hospital, Doctor } from '../../types';
import { DoctorCard } from '../../components/doctors/DoctorCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Button } from '../../components/common/Button';
import { Hospital as HospitalIcon, MapPin, ArrowLeft, CalendarCheck } from 'lucide-react';

// Everything happens on East Care Point: the patient picks this hospital as their preference
// and we make the reservation there, so we don't send them to the hospital's own site or phone line.
export const HospitalDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [notFound, setNotFound] = useState<boolean>(false);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    Promise.all([
      hospitalService.getHospitalById(id),
      doctorService.getAllDoctors({ activeOnly: true }),
    ])
      .then(([h, docs]) => {
        setHospital(h);
        setDoctors(docs);
      })
      .catch(() => setNotFound(true))
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) {
    return <LoadingSpinner message="Loading hospital..." />;
  }

  if (notFound || !hospital) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-3">
        <h1 className="text-2xl font-black text-navy-950">Hospital not found</h1>
        <Link to="/hospitals" className="text-sm font-bold text-teal-700">Back to hospitals</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <Link to="/hospitals" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-navy-900">
        <ArrowLeft className="w-4 h-4" /> All hospitals
      </Link>

      {/* Hospital header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-150 shadow-sm flex flex-col md:flex-row gap-6">
        <div className="w-20 h-20 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center shrink-0">
          <HospitalIcon className="w-10 h-10 text-teal-700" />
        </div>
        <div className="flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-navy-950">{hospital.name}</h1>
            {hospital.sector && (
              <span className="text-xs font-bold bg-slate-50 text-slate-600 px-2.5 py-1 rounded-full border border-slate-100">
                {hospital.sector} {hospital.type}
              </span>
            )}
          </div>
          {hospital.description && <p className="text-sm text-slate-600">{hospital.description}</p>}
          {hospital.address && (
            <p className="flex items-start gap-2 text-sm text-slate-600">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              {hospital.address}{hospital.city && hospital.city !== hospital.address ? `, ${hospital.city}` : ''}
            </p>
          )}
          {hospital.services.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {hospital.services.map((s) => (
                <span key={s} className="text-[11px] font-semibold bg-teal-50 text-teal-800 px-2 py-0.5 rounded-md border border-teal-100">
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="md:self-center">
          <Button
            variant="secondary"
            size="lg"
            leftIcon={<CalendarCheck className="w-5 h-5" />}
            onClick={() => navigate(`/book?hospitalId=${hospital.id}&step=2`)}
          >
            Book through East Care Point
          </Button>
        </div>
      </div>

      {/* Doctors that can be booked through this hospital */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-black text-navy-950">Available doctors</h2>
          <p className="text-sm text-slate-500">Choose a doctor and we will make the reservation at {hospital.name} for you.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doc) => (
            <DoctorCard
              key={doc.id}
              doctor={doc}
              onBook={(d) => navigate(`/book?hospitalId=${hospital.id}&doctorId=${d.id}&step=3`)}
              onViewProfile={(d) => navigate(`/doctors/${d.id}`)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
