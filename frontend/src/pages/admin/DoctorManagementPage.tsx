import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { departmentService } from '../../services/departmentService';
import { hospitalService } from '../../services/hospitalService';
import { doctorService } from '../../services/doctorService';
import { Doctor, Department, Hospital } from '../../types';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Plus, CheckCircle, XCircle, Search } from 'lucide-react';
import { formatLKR } from '../../utils/format';

export const DoctorManagementPage: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');

  // Add doctor modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [newFullName, setNewFullName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('doctor123');
  const [newPhone, setNewPhone] = useState('');
  const [newDeptId, setNewDeptId] = useState('');
  const [newHospitalIds, setNewHospitalIds] = useState<string[]>([]);
  // Edit-hospitals modal for an existing doctor
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [editHospitalIds, setEditHospitalIds] = useState<string[]>([]);
  const [isSavingHospitals, setIsSavingHospitals] = useState(false);
  const [newSpecialty, setNewSpecialty] = useState('');
  const [newQualifications, setNewQualifications] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = () => {
    setIsLoading(true);
    Promise.all([
      adminService.getAllUsers('DOCTOR'),
      departmentService.getDepartments(),
      doctorService.getAllDoctors({ activeOnly: false }),
      hospitalService.getHospitals(false),
    ])
      .then(([_, depts, docs, hosps]) => {
        setDepartments(depts);
        setDoctors(docs);
        setHospitals(hosps);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleStatus = async (doc: Doctor) => {
    try {
      await adminService.setDoctorStatus(doc.id, !doc.active);
      setDoctors((prev) =>
        prev.map((d) => (d.id === doc.id ? { ...d, active: !d.active } : d))
      );
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  const toggleId = (ids: string[], id: string) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]);

  const openEditHospitals = (doc: Doctor) => {
    setEditingDoctor(doc);
    setEditHospitalIds(doc.hospitalIds);
  };

  const handleSaveHospitals = async () => {
    if (!editingDoctor) return;
    setIsSavingHospitals(true);
    try {
      // send "active" too: the update endpoint applies it, and omitting it would deactivate the doctor
      const updated = await adminService.updateDoctor(editingDoctor.id, { hospitalIds: editHospitalIds, active: editingDoctor.active });
      setDoctors((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
      setEditingDoctor(null);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update hospitals');
    } finally {
      setIsSavingHospitals(false);
    }
  };

  const hospitalCheckboxes = (selected: string[], onToggle: (id: string) => void) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {hospitals.map((h) => (
        <label
          key={h.id}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold cursor-pointer transition-colors ${
            selected.includes(h.id) ? 'border-teal-600 bg-teal-50 text-teal-800' : 'border-slate-200 text-slate-700 hover:border-teal-400'
          }`}
        >
          <input type="checkbox" checked={selected.includes(h.id)} onChange={() => onToggle(h.id)} />
          {h.name}
        </label>
      ))}
    </div>
  );

  const handleAddDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newHospitalIds.length === 0) {
      alert('Please select at least one hospital');
      return;
    }
    if (!newDeptId) {
      alert('Please select a department');
      return;
    }
    setIsSubmitting(true);
    try {
      await adminService.createDoctor({
        fullName: newFullName,
        email: newEmail,
        password: newPassword,
        phoneNumber: newPhone,
        departmentId: newDeptId,
        hospitalIds: newHospitalIds,
        specialty: newSpecialty,
        qualifications: newQualifications,
      });
      setIsAddModalOpen(false);
      setNewFullName('');
      setNewEmail('');
      setNewPhone('');
      setNewSpecialty('');
      setNewQualifications('');
      setNewHospitalIds([]);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create doctor');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredDoctors = doctors.filter(
    (d) =>
      d.fullName.toLowerCase().includes(search.toLowerCase()) ||
      d.specialty.toLowerCase().includes(search.toLowerCase()) ||
      d.departmentName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout
      title="Doctors & Medical Faculty"
      subtitle="Onboard medical practitioners, assign departments, and configure account access"
      actions={
        <Button
          variant="secondary"
          size="sm"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setIsAddModalOpen(true)}
        >
          Add Doctor
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Search */}
        <div className="bg-white p-4 rounded-2xl border border-slate-150 flex items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search doctors by name or department..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900"
            />
          </div>
          <span className="text-xs font-bold text-slate-400">Total: {doctors.length} Physicians</span>
        </div>

        {/* Doctors Table */}
        {isLoading ? (
          <LoadingSpinner message="Loading doctor directory..." />
        ) : (
          <div className="bg-white rounded-3xl border border-slate-150 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-150 text-slate-400 uppercase tracking-wider font-bold">
                  <tr>
                    <th className="py-3.5 px-6">Doctor</th>
                    <th className="py-3.5 px-6">Hospital</th>
                    <th className="py-3.5 px-6">Department</th>
                    <th className="py-3.5 px-6">Specialty</th>
                    <th className="py-3.5 px-6">Fee</th>
                    <th className="py-3.5 px-6">Status</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredDoctors.map((doc) => (
                    <tr key={doc.id} className="hover:bg-slate-50/50">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-800 font-bold flex items-center justify-center text-sm border border-teal-100">
                            {doc.fullName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-extrabold text-navy-950 text-sm">{doc.fullName}</p>
                            <p className="text-[11px] text-slate-400">{doc.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        {doc.hospitals.length > 0 ? (
                          <span className="text-slate-600">{doc.hospitals.map((h) => h.name).join(', ')}</span>
                        ) : (
                          <span className="text-amber-700 font-semibold">No hospital (not bookable)</span>
                        )}
                        <button
                          type="button"
                          onClick={() => openEditHospitals(doc)}
                          className="block mt-1 text-[11px] font-bold text-teal-700 hover:text-teal-800"
                        >
                          Edit hospitals
                        </button>
                      </td>
                      <td className="py-4 px-6 font-semibold text-slate-600">{doc.departmentName}</td>
                      <td className="py-4 px-6">{doc.specialty}</td>
                      <td className="py-4 px-6 font-bold text-navy-950">{formatLKR(doc.consultationFee)}</td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                            doc.active
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {doc.active ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          {doc.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleStatus(doc)}
                        >
                          {doc.active ? 'Deactivate' : 'Activate'}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Add Doctor Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Onboard New Medical Doctor"
        description="Create doctor user account and clinical profile"
        maxWidth="lg"
      >
        <form onSubmit={handleAddDoctor} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-navy-950 uppercase mb-1">Full Legal Name *</label>
              <input
                type="text"
                required
                value={newFullName}
                onChange={(e) => setNewFullName(e.target.value)}
                placeholder="Dr. Sunil Rajapaksa"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-navy-950 uppercase mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="sunil.rajapaksa@hospital.lk"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-navy-950 uppercase mb-1">Hospitals * (select all where this doctor works)</label>
              {hospitalCheckboxes(newHospitalIds, (id) => setNewHospitalIds((prev) => toggleId(prev, id)))}
            </div>

            <div>
              <label className="block text-xs font-bold text-navy-950 uppercase mb-1">Department *</label>
              <select
                required
                value={newDeptId}
                onChange={(e) => setNewDeptId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium bg-white"
              >
                <option value="">Select Department</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-navy-950 uppercase mb-1">Sub-Specialty *</label>
              <input
                type="text"
                required
                value={newSpecialty}
                onChange={(e) => setNewSpecialty(e.target.value)}
                placeholder="e.g. Electrophysiology"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-navy-950 uppercase mb-1">Phone Number</label>
              <input
                type="tel"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                placeholder="+94 77 000 0000"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-navy-950 uppercase mb-1">Qualifications</label>
              <input
                type="text"
                value={newQualifications}
                onChange={(e) => setNewQualifications(e.target.value)}
                placeholder="MBBS (Colombo), MD, MRCP (UK)"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="ghost" type="button" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="secondary" type="submit" isLoading={isSubmitting}>
              Create Doctor Account
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Hospitals Modal */}
      <Modal
        isOpen={!!editingDoctor}
        onClose={() => setEditingDoctor(null)}
        title="Hospitals for this doctor"
        description={editingDoctor ? `Patients booking ${editingDoctor.fullName} will choose from these hospitals.` : undefined}
      >
        <div className="space-y-4">
          {hospitalCheckboxes(editHospitalIds, (id) => setEditHospitalIds((prev) => toggleId(prev, id)))}
          {editHospitalIds.length === 0 && (
            <p className="text-xs text-amber-700 font-semibold">With no hospital selected, patients can't book this doctor.</p>
          )}
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="ghost" type="button" onClick={() => setEditingDoctor(null)}>Cancel</Button>
            <Button variant="secondary" type="button" onClick={handleSaveHospitals} isLoading={isSavingHospitals}>Save</Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
};
