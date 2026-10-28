import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { doctorService } from '../../services/doctorService';
import { departmentService } from '../../services/departmentService';
import { Doctor, Department } from '../../types';
import { DoctorCard } from '../../components/doctors/DoctorCard';
import { DoctorFilter } from '../../components/doctors/DoctorFilter';
import { BookingModal } from '../../components/appointments/BookingModal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { useAuth } from '../../contexts/AuthContext';
import { Stethoscope } from 'lucide-react';

export const DoctorsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [bookingDoctor, setBookingDoctor] = useState<Doctor | null>(null);

  const search = searchParams.get('search') || '';
  const selectedDepartment = searchParams.get('departmentId') || '';
  const specialty = searchParams.get('specialty') || '';

  useEffect(() => {
    departmentService.getDepartments().then(setDepartments).catch(console.error);
  }, []);

  useEffect(() => {
    setIsLoading(true);
    doctorService.getAllDoctors({
      search: search || undefined,
      departmentId: selectedDepartment || undefined,
      specialty: specialty || undefined,
      activeOnly: true,
    })
      .then(setDoctors)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [search, selectedDepartment, specialty]);

  const updateParam = (key: string, val: string) => {
    const next = new URLSearchParams(searchParams);
    if (val) {
      next.set(key, val);
    } else {
      next.delete(key);
    }
    setSearchParams(next);
  };

  const handleReset = () => {
    setSearchParams(new URLSearchParams());
  };

  const handleBook = (doc: Doctor) => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/doctors');
      return;
    }
    setBookingDoctor(doc);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Title */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-teal-700">Medical Faculty</span>
        <h1 className="text-3xl font-black text-navy-950 mt-1">Our Doctors & Clinical Specialists</h1>
        <p className="text-sm text-slate-500 mt-1">
          Select from our board-certified medical experts, view daily availability, and book your consultation.
        </p>
      </div>

      {/* Filters */}
      <DoctorFilter
        search={search}
        onSearchChange={(val) => updateParam('search', val)}
        selectedDepartment={selectedDepartment}
        onDepartmentChange={(val) => updateParam('departmentId', val)}
        departments={departments}
        specialty={specialty}
        onSpecialtyChange={(val) => updateParam('specialty', val)}
        onReset={handleReset}
      />

      {/* Doctor Grid */}
      {isLoading ? (
        <LoadingSpinner message="Searching specialists..." />
      ) : doctors.length === 0 ? (
        <EmptyState
          title="No doctors matched your criteria"
          description="Try broadening your search term or clearing the active filters to view all available physicians."
          icon={<Stethoscope className="w-8 h-8" />}
          actionText="Clear All Filters"
          onAction={handleReset}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doc) => (
            <DoctorCard
              key={doc.id}
              doctor={doc}
              onBook={handleBook}
              onViewProfile={(d) => navigate(`/doctors/${d.id}`)}
            />
          ))}
        </div>
      )}

      {/* Booking Modal */}
      <BookingModal
        doctor={bookingDoctor}
        isOpen={!!bookingDoctor}
        onClose={() => setBookingDoctor(null)}
        onSuccess={() => {
          navigate('/patient/appointments');
        }}
      />
    </div>
  );
};
