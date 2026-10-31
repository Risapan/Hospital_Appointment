import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { departmentService } from '../../services/departmentService';
import { Department } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  Activity, ArrowRight, HeartPulse, Brain, Bone, Baby, Shield,
  Stethoscope, Fingerprint, Pill, BrainCircuit, Scissors, Smile, HeartHandshake, Microscope, Syringe,
} from 'lucide-react';

export const DepartmentsPage: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    departmentService.getDepartments()
      .then(setDepartments)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const getIcon = (name: string) => {
    // British (Sri Lankan) and US spellings both map to the same icon
    switch (name.toLowerCase().replace('ae', 'e')) {
      case 'cardiology': return <HeartPulse className="w-8 h-8 text-rose-600" />;
      case 'neurology': return <Brain className="w-8 h-8 text-indigo-600" />;
      case 'orthopedics': return <Bone className="w-8 h-8 text-teal-600" />;
      case 'pediatrics': return <Baby className="w-8 h-8 text-amber-600" />;
      case 'general medicine': return <Stethoscope className="w-8 h-8 text-sky-600" />;
      case 'dermatology': return <Fingerprint className="w-8 h-8 text-orange-600" />;
      case 'gastroenterology': return <Pill className="w-8 h-8 text-lime-600" />;
      case 'psychiatry': return <BrainCircuit className="w-8 h-8 text-violet-600" />;
      case 'general surgery': return <Scissors className="w-8 h-8 text-slate-600" />;
      case 'dental surgery': return <Smile className="w-8 h-8 text-cyan-600" />;
      case 'general opd': return <Stethoscope className="w-8 h-8 text-emerald-600" />;
      case 'microbiology':
      case 'histopathology': return <Microscope className="w-8 h-8 text-fuchsia-600" />;
      case 'anesthesiology': return <Syringe className="w-8 h-8 text-blue-600" />;
      case 'obstetrics & gynecology': return <HeartHandshake className="w-8 h-8 text-pink-600" />;
      default: return <Activity className="w-8 h-8 text-teal-600" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-teal-700">Specialized Medicine</span>
        <h1 className="text-3xl font-black text-navy-950 mt-1">Hospital Clinical Departments</h1>
        <p className="text-sm text-slate-500 mt-1">
          Explore our multidisciplinary departments equipped with advanced medical technology and distinguished clinical staff.
        </p>
      </div>

      {isLoading ? (
        <LoadingSpinner message="Loading departments..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {departments.map((dept) => (
            <div
              key={dept.id}
              className="bg-white rounded-3xl p-8 border border-slate-150 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-150 flex items-center justify-center">
                  {getIcon(dept.name)}
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-navy-950">{dept.name}</h3>
                  <p className="mt-2 text-sm text-slate-600 leading-relaxed">{dept.description}</p>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Board-Certified Specialists</span>
                <Link
                  to={`/doctors?departmentId=${dept.id}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 hover:text-teal-800"
                >
                  View Doctors in {dept.name} <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
