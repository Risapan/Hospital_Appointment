import React from 'react';
import { Doctor } from '../../types';
import { Button } from '../common/Button';
import { Star, Clock, Calendar, MapPin, Award, CheckCircle } from 'lucide-react';

interface DoctorCardProps {
  doctor: Doctor;
  onBook: (doctor: Doctor) => void;
  onViewProfile?: (doctor: Doctor) => void;
}

export const DoctorCard: React.FC<DoctorCardProps> = ({ doctor, onBook, onViewProfile }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-150 p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between group">
      <div>
        <div className="flex items-start gap-4">
          {/* Doctor Avatar */}
          <div className="relative shrink-0">
            {doctor.profileImageUrl ? (
              <img
                src={doctor.profileImageUrl}
                alt={doctor.fullName}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-teal-50 group-hover:border-teal-200 transition-colors shadow-sm"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-navy-50 text-navy-800 font-black text-2xl flex items-center justify-center border-2 border-slate-100">
                {doctor.fullName.charAt(0)}
              </div>
            )}
            <span className="absolute -bottom-1.5 -right-1.5 bg-emerald-500 text-white p-0.5 rounded-full ring-2 ring-white">
              <CheckCircle className="w-3.5 h-3.5" />
            </span>
          </div>

          {/* Details Header */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-100/80">
                {doctor.departmentName || 'Specialist'}
              </span>
              <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                4.9 (120+ reviews)
              </span>
            </div>

            <h3 className="text-lg font-extrabold text-navy-950 mt-1 truncate group-hover:text-teal-700 transition-colors">
              {doctor.fullName}
            </h3>
            <p className="text-xs font-semibold text-slate-500 truncate">{doctor.qualifications}</p>
            <p className="text-xs font-bold text-navy-800 mt-0.5">{doctor.specialty}</p>
          </div>
        </div>

        {/* Bio snippet */}
        {doctor.biography && (
          <p className="mt-4 text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {doctor.biography}
          </p>
        )}

        {/* Quick Highlights */}
        <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs text-slate-600">
          <div className="flex items-center gap-1.5">
            <Award className="w-4 h-4 text-slate-400" />
            <span>{doctor.experienceYears}+ Yrs Experience</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-slate-400" />
            <span>{doctor.consultationDurationMinutes} min slot</span>
          </div>
          {doctor.roomNumber && (
            <div className="flex items-center gap-1.5 col-span-2">
              <MapPin className="w-4 h-4 text-slate-400" />
              <span>Room {doctor.roomNumber}</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer / Actions */}
      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
        <div>
          <span className="block text-[11px] text-slate-400 uppercase font-semibold">Consultation</span>
          <span className="text-lg font-black text-navy-950">
            ${doctor.consultationFee ? doctor.consultationFee.toFixed(2) : '50.00'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onViewProfile && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewProfile(doctor)}
            >
              Details
            </Button>
          )}
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Calendar className="w-3.5 h-3.5" />}
            onClick={() => onBook(doctor)}
          >
            Book Slot
          </Button>
        </div>
      </div>
    </div>
  );
};
