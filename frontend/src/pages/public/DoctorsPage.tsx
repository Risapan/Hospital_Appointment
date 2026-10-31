import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { doctorService } from '../../services/doctorService';
import { departmentService } from '../../services/departmentService';
import { hospitalService } from '../../services/hospitalService';
import { Doctor, Department, Hospital } from '../../types';
import { DoctorCard } from '../../components/doctors/DoctorCard';
import { DoctorFilter } from '../../components/doctors/DoctorFilter';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { Stethoscope } from 'lucide-react';
import { HistoryNav } from '../../components/common/HistoryNav';

export const DoctorsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const search = searchParams.get('search') || '';
  const selectedDepartment = searchParams.get('departmentId') || '';
  const specialty = searchParams.get('specialty') || '';
  const selectedHospital = searchParams.get('hospitalId') || '';

  useEffect(() => {
    departmentService.getDepartments().then(setDepartments).catch(console.error);
    hospitalService.getHospitals().then(setHospitals).catch(console.error);
  }, []);

  useEffect(() => {
    setIsLoading(true);
    doctorService.getAllDoctors({
      search: search || undefined,
      departmentId: selectedDepartment || undefined,
      specialty: specialty || undefined,
      hospitalId: selectedHospital || undefined,
      activeOnly: true,
    })
      .then(setDoctors)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [search, selectedDepartment, specialty, selectedHospital]);

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

  // Booking starts by asking which hospital the patient prefers
  const handleBook = (doc: Doctor) => {
    navigate(`/book?doctorId=${doc.id}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back / Forward */}
      <HistoryNav showLabels />

      {/* Title */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-teal-700">Find a Doctor</span>
        <h1 className="text-3xl font-black text-navy-950 mt-1">Doctors in Batticaloa</h1>
        <p className="text-sm text-slate-500 mt-1">
          Choose a hospital and doctor, check available times, and we will reserve your appointment at that hospital.
        </p>
      </div>

      {/* Filters */}
      <DoctorFilter
        search={search}
        onSearchChange={(val) => updateParam('search', val)}
        selectedDepartment={selectedDepartment}
        onDepartmentChange={(val) => updateParam('departmentId', val)}
        departments={departments}
        selectedHospital={selectedHospital}
        onHospitalChange={(val) => updateParam('hospitalId', val)}
        hospitals={hospitals}
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

    </div>
  );
};
