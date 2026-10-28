import React, { useState, useEffect } from 'react';
import { patientService } from '../../services/notificationService';
import { PatientProfile } from '../../types';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { User, Heart, Shield, Phone, MapPin, AlertCircle, CheckCircle2 } from 'lucide-react';

export const PatientProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    patientService.getMyProfile()
      .then(setProfile)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setIsSaving(true);
    setMessage(null);
    try {
      const updated = await patientService.updateMyProfile(profile);
      setProfile(updated);
      setMessage({ text: 'Medical profile updated successfully!', type: 'success' });
    } catch (err: any) {
      setMessage({ text: err.response?.data?.message || 'Failed to update profile', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <LoadingSpinner message="Loading patient health profile..." />;
  if (!profile) return null;

  return (
    <DashboardLayout
      title="Personal Medical Profile"
      subtitle="Confidential medical history, blood group, emergency contacts, and contact info"
    >
      <div className="max-w-4xl mx-auto space-y-6">
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

        <form onSubmit={handleSave} className="space-y-6">
          {/* Section 1: Basic Info */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-150 shadow-sm space-y-4">
            <h3 className="text-base font-extrabold text-navy-950 flex items-center gap-2">
              <User className="w-5 h-5 text-teal-600" /> Basic Patient Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-navy-950 uppercase mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={profile.fullName || ''}
                  onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-navy-950 uppercase mb-1.5">Email Address</label>
                <input
                  type="email"
                  disabled
                  value={profile.email || ''}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 text-slate-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-navy-950 uppercase mb-1.5">Phone Number</label>
                <input
                  type="tel"
                  value={profile.phoneNumber || ''}
                  onChange={(e) => setProfile({ ...profile, phoneNumber: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-navy-950 uppercase mb-1.5">Date of Birth</label>
                <input
                  type="date"
                  value={profile.dateOfBirth || ''}
                  onChange={(e) => setProfile({ ...profile, dateOfBirth: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-navy-950 uppercase mb-1.5">Gender</label>
                <select
                  value={profile.gender || ''}
                  onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900 bg-white"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-navy-950 uppercase mb-1.5">Blood Group</label>
                <select
                  value={profile.bloodGroup || ''}
                  onChange={(e) => setProfile({ ...profile, bloodGroup: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900 bg-white"
                >
                  <option value="">Select Blood Group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Emergency Contact & Address */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-150 shadow-sm space-y-4">
            <h3 className="text-base font-extrabold text-navy-950 flex items-center gap-2">
              <Phone className="w-5 h-5 text-amber-600" /> Emergency Contact & Address
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-navy-950 uppercase mb-1.5">Emergency Contact Name</label>
                <input
                  type="text"
                  value={profile.emergencyContactName || ''}
                  onChange={(e) => setProfile({ ...profile, emergencyContactName: e.target.value })}
                  placeholder="e.g. Mary Miller (Spouse)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-navy-950 uppercase mb-1.5">Emergency Contact Phone</label>
                <input
                  type="tel"
                  value={profile.emergencyContactPhone || ''}
                  onChange={(e) => setProfile({ ...profile, emergencyContactPhone: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-navy-950 uppercase mb-1.5">Residential Address</label>
                <input
                  type="text"
                  value={profile.address || ''}
                  onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                  placeholder="Street address, City, State, Zip"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Clinical Notes */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-150 shadow-sm space-y-4">
            <h3 className="text-base font-extrabold text-navy-950 flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-600" /> Medical Conditions & Allergies
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-navy-950 uppercase mb-1.5">Known Allergies</label>
                <input
                  type="text"
                  value={profile.allergies || ''}
                  onChange={(e) => setProfile({ ...profile, allergies: e.target.value })}
                  placeholder="e.g. Penicillin, Peanuts, Sulfa drugs"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-navy-950 uppercase mb-1.5">Past Medical History</label>
                <textarea
                  value={profile.medicalHistory || ''}
                  onChange={(e) => setProfile({ ...profile, medicalHistory: e.target.value })}
                  placeholder="Pre-existing conditions, past surgeries, ongoing prescriptions..."
                  rows={3}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button variant="secondary" type="submit" isLoading={isSaving}>
              Save Profile Updates
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};
