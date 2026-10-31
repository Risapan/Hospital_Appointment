import React, { useState, useEffect } from 'react';
import { hospitalService } from '../../services/hospitalService';
import { Hospital } from '../../types';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Plus, Edit2, Hospital as HospitalIcon, Phone, MapPin, Stethoscope } from 'lucide-react';

type HospitalForm = Omit<Hospital, 'id' | 'doctorCount' | 'services'> & { servicesText: string };

const emptyForm: HospitalForm = {
  name: '', type: 'Hospital', sector: 'Private', address: '', city: 'Batticaloa',
  phone: '', whatsapp: '', email: '', website: '', mapUrl: '', description: '', active: true, servicesText: '',
};

const inputClass = 'w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium';

export const HospitalManagementPage: React.FC = () => {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editing, setEditing] = useState<Hospital | null>(null);
  const [form, setForm] = useState<HospitalForm>(emptyForm);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const fetchHospitals = () => {
    setIsLoading(true);
    hospitalService.getHospitals(false)
      .then(setHospitals)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchHospitals();
  }, []);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setIsModalOpen(true);
  };

  const openEdit = (h: Hospital) => {
    setEditing(h);
    const { id: _id, doctorCount: _count, services, ...rest } = h;
    setForm({ ...emptyForm, ...rest, servicesText: services.join(', ') });
    setIsModalOpen(true);
  };

  const set = (key: keyof HospitalForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const { servicesText, ...rest } = form;
    const payload = { ...rest, services: servicesText.split(',').map((s) => s.trim()).filter(Boolean) };
    try {
      if (editing) {
        await hospitalService.updateHospital(editing.id, payload);
      } else {
        await hospitalService.createHospital(payload);
      }
      setIsModalOpen(false);
      fetchHospitals();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save hospital');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DashboardLayout
      title="Hospital Management"
      subtitle="Hospitals and clinics that East Care Point makes reservations for"
      actions={
        <Button variant="secondary" size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={openAdd}>
          Add Hospital
        </Button>
      }
    >
      {isLoading ? (
        <LoadingSpinner message="Loading hospitals..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {hospitals.map((h) => (
            <div key={h.id} className="bg-white rounded-3xl p-6 border border-slate-150 shadow-sm flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center">
                    <HospitalIcon className="w-5 h-5" />
                  </div>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${h.active ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                    {h.active ? 'Active' : 'Hidden'}
                  </span>
                </div>
                <h3 className="text-lg font-black text-navy-950">{h.name}</h3>
                <p className="text-xs text-slate-400 font-semibold">{h.sector} {h.type}</p>
                <p className="text-xs text-slate-600 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-slate-400" /> {h.address || '—'}</p>
                <p className={`text-xs flex items-center gap-1.5 ${h.phone ? 'text-slate-600' : 'text-amber-700 font-semibold'}`}>
                  <Phone className="w-3.5 h-3.5 text-slate-400" /> {h.phone || 'Phone number missing'}
                </p>
                <p className="text-xs text-slate-600 flex items-center gap-1.5"><Stethoscope className="w-3.5 h-3.5 text-slate-400" /> {h.doctorCount} active doctors</p>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-100 flex justify-end">
                <Button variant="outline" size="sm" leftIcon={<Edit2 className="w-3.5 h-3.5" />} onClick={() => openEdit(h)}>
                  Edit
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editing ? 'Edit Hospital' : 'Add Hospital'}
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-navy-950 mb-1">Name *</label>
            <input required value={form.name} onChange={set('name')} placeholder="e.g. EMS Hospital" className={inputClass} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-navy-950 mb-1">Type</label>
              <select value={form.type} onChange={set('type')} className={inputClass}>
                <option>Hospital</option>
                <option>Dental Clinic</option>
                <option>Medical Centre</option>
                <option>Teaching Hospital</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-navy-950 mb-1">Sector</label>
              <select value={form.sector} onChange={set('sector')} className={inputClass}>
                <option>Private</option>
                <option>Government</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-navy-950 mb-1">Address</label>
              <input value={form.address} onChange={set('address')} placeholder="No. 121, New Kalmunai Road" className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-bold text-navy-950 mb-1">City</label>
              <input value={form.city} onChange={set('city')} className={inputClass} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-navy-950 mb-1">Phone</label>
              <input value={form.phone} onChange={set('phone')} placeholder="+94 65 222 0000" className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-bold text-navy-950 mb-1">WhatsApp</label>
              <input value={form.whatsapp} onChange={set('whatsapp')} placeholder="+94 70 000 0000" className={inputClass} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-navy-950 mb-1">Email</label>
              <input type="email" value={form.email} onChange={set('email')} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-bold text-navy-950 mb-1">Website</label>
              <input value={form.website} onChange={set('website')} placeholder="https://" className={inputClass} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-navy-950 mb-1">Google Maps link</label>
            <input value={form.mapUrl} onChange={set('mapUrl')} placeholder="https://maps.app.goo.gl/..." className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-bold text-navy-950 mb-1">Services (comma separated)</label>
            <input value={form.servicesText} onChange={set('servicesText')} placeholder="Channelling, Cardiology, Dental Care" className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-bold text-navy-950 mb-1">Description</label>
            <textarea rows={2} value={form.description} onChange={set('description')} className={inputClass} />
          </div>
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700">
            <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
            Show on website
          </label>
          <Button type="submit" variant="primary" className="w-full" isLoading={isSaving}>
            {editing ? 'Save Changes' : 'Add Hospital'}
          </Button>
        </form>
      </Modal>
    </DashboardLayout>
  );
};
