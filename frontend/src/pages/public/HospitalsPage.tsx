import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { hospitalService } from '../../services/hospitalService';
import { Hospital } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { Hospital as HospitalIcon, MapPin, Phone, Stethoscope, ArrowRight, Smile } from 'lucide-react';

export const HospitalsPage: React.FC = () => {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<boolean>(false);

  useEffect(() => {
    hospitalService.getHospitals()
      .then(setHospitals)
      .catch(() => setLoadError(true))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-teal-700">Hospitals in Batticaloa</span>
        <h1 className="text-3xl font-black text-navy-950 mt-1">Choose a Hospital</h1>
        <p className="text-sm text-slate-500 mt-1 max-w-2xl">
          Not every hospital has its own booking website. Pick a hospital below, choose a doctor and time,
          and East Care Point will make the reservation at that hospital for you.
        </p>
      </div>

      {isLoading ? (
        <LoadingSpinner message="Loading hospitals..." />
      ) : loadError ? (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-800 text-sm">
          Couldn't load hospitals. Please check your connection, or that the server is running, and try again.
        </div>
      ) : hospitals.length === 0 ? (
        <EmptyState
          title="No hospitals yet"
          description="Hospitals will appear here once they are added."
          icon={<HospitalIcon className="w-8 h-8" />}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hospitals.map((h) => (
            <Link
              key={h.id}
              to={`/hospitals/${h.id}`}
              className="group bg-white rounded-2xl p-6 border border-slate-150 shadow-sm hover:shadow-md hover:border-teal-200 transition-all flex flex-col"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center shrink-0">
                  {h.type === 'Dental Clinic'
                    ? <Smile className="w-7 h-7 text-cyan-600" />
                    : <HospitalIcon className="w-7 h-7 text-teal-700" />}
                </div>
                {h.sector && (
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                    h.sector === 'Government' ? 'bg-sky-50 text-sky-800' : 'bg-amber-50 text-amber-800'
                  }`}>
                    {h.sector}
                  </span>
                )}
              </div>

              <h2 className="mt-4 text-lg font-extrabold text-navy-950 group-hover:text-teal-700 transition-colors">{h.name}</h2>
              <p className="text-xs font-semibold text-slate-400">{h.type}</p>

              <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                {h.address && (
                  <p className="flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    {h.address}{h.city && h.city !== h.address ? `, ${h.city}` : ''}
                  </p>
                )}
                {h.phone && (
                  <p className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {h.phone}
                  </p>
                )}
              </div>

              {h.services.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {h.services.slice(0, 4).map((s) => (
                    <span key={s} className="text-[11px] font-semibold bg-slate-50 text-slate-600 px-2 py-0.5 rounded-md border border-slate-100">
                      {s}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-auto pt-5 flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                  <Stethoscope className="w-4 h-4 text-slate-400" />
                  Book through East Care Point
                </span>
                <span className="flex items-center gap-1 font-bold text-teal-700">
                  View <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      <p className="text-xs text-slate-400">
        East Care Point is an independent booking service and is not operated by the hospitals listed.
      </p>
    </div>
  );
};
