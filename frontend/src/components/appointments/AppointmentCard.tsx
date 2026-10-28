import React from 'react';
import { Appointment, Role } from '../../types';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Calendar, Clock, MapPin, User, FileText, XCircle, RotateCcw, CheckCircle } from 'lucide-react';

interface AppointmentCardProps {
  appointment: Appointment;
  currentRole: Role;
  onCancel?: (appointment: Appointment) => void;
  onReschedule?: (appointment: Appointment) => void;
  onUpdateStatus?: (appointment: Appointment, status: any) => void;
}

export const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  currentRole,
  onCancel,
  onReschedule,
  onUpdateStatus,
}) => {
  const startDate = new Date(appointment.startDateTime);
  const formattedDate = startDate.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const formattedTime = startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const isPast = startDate < new Date();
  const canCancel = appointment.status === 'CONFIRMED' || appointment.status === 'PENDING';
  const canReschedule = canCancel && !isPast && currentRole === 'PATIENT';

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <Badge status={appointment.status}>{appointment.status}</Badge>
            <span className="text-xs font-semibold text-slate-400">ID: #{appointment.id.slice(-6)}</span>
          </div>
          <h4 className="text-base font-extrabold text-navy-950 mt-1">
            {currentRole === 'PATIENT' ? appointment.doctorName : appointment.patientName}
          </h4>
          <p className="text-xs text-slate-500 font-semibold">
            {currentRole === 'PATIENT' ? (
              `${appointment.doctorSpecialty} • ${appointment.departmentName}`
            ) : (
              `Patient Phone: ${appointment.patientPhone || 'N/A'}`
            )}
          </p>
        </div>

        {/* Date Time Badge */}
        <div className="bg-slate-50 border border-slate-150 rounded-xl px-4 py-2 text-right">
          <div className="flex items-center gap-1.5 text-xs font-bold text-navy-900 justify-end">
            <Calendar className="w-3.5 h-3.5 text-teal-600" />
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 justify-end mt-0.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{formattedTime}</span>
          </div>
        </div>
      </div>

      {/* Body Information */}
      <div className="py-3.5 space-y-2 text-xs text-slate-600">
        <div className="flex items-start gap-2">
          <FileText className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-navy-900">Reason: </span>
            <span>{appointment.reasonForVisit}</span>
          </div>
        </div>

        {appointment.roomNumber && (
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
            <span>Room: {appointment.roomNumber}</span>
          </div>
        )}

        {appointment.doctorNotes && (
          <div className="p-3 bg-teal-50/50 rounded-xl border border-teal-100 text-teal-900">
            <span className="font-bold block text-[11px] uppercase tracking-wider text-teal-700">Doctor's Notes:</span>
            <p className="mt-0.5">{appointment.doctorNotes}</p>
          </div>
        )}

        {appointment.cancellationReason && (
          <div className="p-3 bg-rose-50/60 rounded-xl border border-rose-100 text-rose-800">
            <span className="font-bold block text-[11px] uppercase tracking-wider text-rose-600">Cancellation Reason:</span>
            <p className="mt-0.5">{appointment.cancellationReason}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      {(canCancel || currentRole === 'DOCTOR') && (
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-end gap-2">
          {canReschedule && onReschedule && (
            <Button
              variant="outline"
              size="sm"
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              onClick={() => onReschedule(appointment)}
            >
              Reschedule
            </Button>
          )}

          {canCancel && onCancel && (
            <Button
              variant="ghost"
              size="sm"
              className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
              leftIcon={<XCircle className="w-3.5 h-3.5" />}
              onClick={() => onCancel(appointment)}
            >
              Cancel
            </Button>
          )}

          {/* Doctor status updates */}
          {currentRole === 'DOCTOR' && appointment.status === 'CONFIRMED' && onUpdateStatus && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                leftIcon={<CheckCircle className="w-3.5 h-3.5" />}
                onClick={() => onUpdateStatus(appointment, 'COMPLETED')}
              >
                Mark Completed
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-500 hover:bg-slate-100"
                onClick={() => onUpdateStatus(appointment, 'NO_SHOW')}
              >
                No Show
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
};
