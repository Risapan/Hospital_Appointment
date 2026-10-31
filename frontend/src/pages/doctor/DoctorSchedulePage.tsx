import React, { useState, useEffect } from 'react';
import { doctorService } from '../../services/doctorService';
import { Availability, BlockedPeriod } from '../../types';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Clock, Plus, Trash2, CalendarOff, CheckCircle2, AlertCircle } from 'lucide-react';
import { formatDateTime } from '../../utils/format';

export const DoctorSchedulePage: React.FC = () => {
  const [schedules, setSchedules] = useState<Availability[]>([]);
  const [blockedPeriods, setBlockedPeriods] = useState<BlockedPeriod[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // New blocked period form state
  const [blockStart, setBlockStart] = useState('');
  const [blockEnd, setBlockEnd] = useState('');
  const [blockReason, setBlockReason] = useState('Vacation');
  const [blockNote, setBlockNote] = useState('');
  const [isAddingBlock, setIsAddingBlock] = useState(false);

  const daysOfWeek = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'] as const;

  const loadData = async () => {
    setIsLoading(true);
    try {
      const prof = await doctorService.getMyProfile();
      if (prof?.id) {
        const [scheds, blocks] = await Promise.all([
          doctorService.getDoctorSchedules(prof.id),
          doctorService.getBlockedPeriods(),
        ]);

        // Merge with all days of week
        const fullScheds: Availability[] = daysOfWeek.map((day) => {
          const existing = scheds.find((s) => s.dayOfWeek === day);
          return (
            existing || {
              doctorId: prof.id,
              dayOfWeek: day,
              startTime: '09:00:00',
              endTime: '17:00:00',
              slotDurationMinutes: 30,
              active: day !== 'SATURDAY' && day !== 'SUNDAY',
            }
          );
        });

        setSchedules(fullScheds);
        setBlockedPeriods(blocks);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleDay = (index: number) => {
    const updated = [...schedules];
    updated[index].active = !updated[index].active;
    setSchedules(updated);
  };

  const handleTimeChange = (index: number, field: 'startTime' | 'endTime', value: string) => {
    const updated = [...schedules];
    updated[index][field] = value.length === 5 ? `${value}:00` : value;
    setSchedules(updated);
  };

  const handleSaveWorkingHours = async () => {
    setIsSaving(true);
    setMessage(null);
    try {
      await doctorService.updateAvailability(schedules);
      setMessage({ text: 'Weekly working hours updated successfully!', type: 'success' });
    } catch (err: any) {
      setMessage({ text: err.response?.data?.message || 'Failed to update hours', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddBlockedPeriod = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blockStart || !blockEnd) return;
    setIsAddingBlock(true);
    try {
      await doctorService.addBlockedPeriod({
        doctorId: '', // backend resolves doctor from token
        startDateTime: blockStart,
        endDateTime: blockEnd,
        reasonCategory: blockReason,
        reasonNote: blockNote,
      });
      setBlockStart('');
      setBlockEnd('');
      setBlockNote('');
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add blocked period');
    } finally {
      setIsAddingBlock(false);
    }
  };

  const handleDeleteBlocked = async (id: string) => {
    if (confirm('Delete this blocked period? Slots during this time will become available.')) {
      await doctorService.deleteBlockedPeriod(id);
      loadData();
    }
  };

  if (isLoading) return <LoadingSpinner message="Loading schedule settings..." />;

  return (
    <DashboardLayout
      title="Schedule & Availability Management"
      subtitle="Define your clinical consulting days, working hours, slot durations, and vacation blocks"
    >
      <div className="space-y-8 max-w-5xl">
        {message && (
          <div
            className={`p-4 rounded-2xl text-xs font-semibold flex items-center gap-2 ${
              message.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{message.text}</span>
          </div>
        )}

        {/* Section 1: Weekly Consulting Schedule */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-150 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-navy-950 flex items-center gap-2">
                <Clock className="w-5 h-5 text-teal-600" /> Weekly Working Hours
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Toggle active days and configure shift start and finish times</p>
            </div>
            <Button variant="secondary" onClick={handleSaveWorkingHours} isLoading={isSaving}>
              Save Hours
            </Button>
          </div>

          <div className="space-y-3">
            {schedules.map((s, idx) => (
              <div
                key={s.dayOfWeek}
                className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  s.active ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-100 opacity-60'
                }`}
              >
                <div className="flex items-center gap-4 w-44">
                  <input
                    type="checkbox"
                    checked={s.active}
                    onChange={() => handleToggleDay(idx)}
                    className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500 cursor-pointer"
                  />
                  <span className={`text-sm font-bold ${s.active ? 'text-navy-950' : 'text-slate-400'}`}>
                    {s.dayOfWeek}
                  </span>
                </div>

                {s.active ? (
                  <div className="flex items-center gap-3 text-xs">
                    <div>
                      <span className="block text-slate-400 text-[10px] uppercase font-semibold mb-1">Start Time</span>
                      <input
                        type="time"
                        value={s.startTime.slice(0, 5)}
                        onChange={(e) => handleTimeChange(idx, 'startTime', e.target.value)}
                        className="px-2.5 py-1.5 rounded-xl border border-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-navy-900 bg-white"
                      />
                    </div>
                    <span className="text-slate-300 mt-4">—</span>
                    <div>
                      <span className="block text-slate-400 text-[10px] uppercase font-semibold mb-1">End Time</span>
                      <input
                        type="time"
                        value={s.endTime.slice(0, 5)}
                        onChange={(e) => handleTimeChange(idx, 'endTime', e.target.value)}
                        className="px-2.5 py-1.5 rounded-xl border border-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-navy-900 bg-white"
                      />
                    </div>
                  </div>
                ) : (
                  <span className="text-xs font-semibold text-slate-400">Day Off / Unavailable</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Blocked Periods / Leave / Breaks */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-150 shadow-sm space-y-6">
          <div>
            <h3 className="text-lg font-black text-navy-950 flex items-center gap-2">
              <CalendarOff className="w-5 h-5 text-rose-600" /> Blocked Dates & Leave Periods
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Lock out date ranges for surgeries, academic conferences, vacations, or sick leave.
            </p>
          </div>

          {/* Add Block Form */}
          <form onSubmit={handleAddBlockedPeriod} className="p-5 bg-slate-50 rounded-2xl border border-slate-150 space-y-4">
            <h4 className="text-xs font-bold text-navy-950 uppercase tracking-wider">Add Unavailable Period</h4>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Start Date & Time</label>
                <input
                  type="datetime-local"
                  required
                  value={blockStart}
                  onChange={(e) => setBlockStart(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium bg-white focus:outline-none focus:ring-2 focus:ring-navy-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">End Date & Time</label>
                <input
                  type="datetime-local"
                  required
                  value={blockEnd}
                  onChange={(e) => setBlockEnd(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium bg-white focus:outline-none focus:ring-2 focus:ring-navy-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Reason</label>
                <select
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium bg-white focus:outline-none focus:ring-2 focus:ring-navy-900"
                >
                  <option value="Vacation">Vacation</option>
                  <option value="Surgery">Surgery / In Theatre</option>
                  <option value="Conference">Medical Conference</option>
                  <option value="Personal">Personal Leave</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Notes (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Annual Leave"
                  value={blockNote}
                  onChange={(e) => setBlockNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium bg-white focus:outline-none focus:ring-2 focus:ring-navy-900"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="primary" size="sm" type="submit" isLoading={isAddingBlock}>
                Block Out Period
              </Button>
            </div>
          </form>

          {/* Existing Blocked Periods List */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-navy-950 uppercase tracking-wider">Active Blocked Windows</h4>
            {blockedPeriods.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 italic">No blocked dates currently recorded.</p>
            ) : (
              <div className="space-y-2">
                {blockedPeriods.map((bp) => (
                  <div
                    key={bp.id}
                    className="p-3.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-navy-950">{bp.reasonCategory}</span>
                      {bp.reasonNote && <span className="text-slate-500 ml-2">({bp.reasonNote})</span>}
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {formatDateTime(bp.startDateTime)} — {formatDateTime(bp.endDateTime)}
                      </p>
                    </div>

                    <button
                      onClick={() => bp.id && handleDeleteBlocked(bp.id)}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Remove Block"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
