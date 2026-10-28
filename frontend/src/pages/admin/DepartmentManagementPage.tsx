import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { departmentService } from '../../services/departmentService';
import { Department } from '../../types';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Building2, Plus, Edit2, Trash2 } from 'lucide-react';

export const DepartmentManagementPage: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('Activity');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadDepartments = () => {
    setIsLoading(true);
    departmentService.getDepartments(false)
      .then(setDepartments)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  const handleOpenAdd = () => {
    setEditingDept(null);
    setName('');
    setDescription('');
    setIcon('Activity');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (d: Department) => {
    setEditingDept(d);
    setName(d.name);
    setDescription(d.description);
    setIcon(d.icon || 'Activity');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingDept) {
        await adminService.updateDepartment(editingDept.id, { name, description, icon });
      } else {
        await adminService.createDepartment({ name, description, icon, active: true });
      }
      setIsModalOpen(false);
      loadDepartments();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to remove this department?')) {
      await adminService.deleteDepartment(id);
      loadDepartments();
    }
  };

  return (
    <DashboardLayout
      title="Department Management"
      subtitle="Configure clinical departments, services offered, and specialized centers"
      actions={
        <Button variant="secondary" size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={handleOpenAdd}>
          Add Department
        </Button>
      }
    >
      <div className="space-y-6">
        {isLoading ? (
          <LoadingSpinner message="Loading departments..." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {departments.map((d) => (
              <div key={d.id} className="bg-white rounded-3xl p-6 border border-slate-150 shadow-sm flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center font-bold">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${d.active ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                      {d.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <h3 className="text-lg font-black text-navy-950">{d.name}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{d.description}</p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                  <Button variant="outline" size="sm" leftIcon={<Edit2 className="w-3.5 h-3.5" />} onClick={() => handleOpenEdit(d)}>
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm" className="text-rose-600 hover:bg-rose-50" onClick={() => handleDelete(d.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingDept ? 'Edit Department' : 'Add New Department'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-navy-950 uppercase mb-1">Department Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Oncology, Radiology"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-navy-950 uppercase mb-1">Description *</label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Services, facilities, and procedures..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="secondary" type="submit" isLoading={isSubmitting}>
              {editingDept ? 'Save Changes' : 'Create Department'}
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};
