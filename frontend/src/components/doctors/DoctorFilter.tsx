import React from 'react';
import { Department } from '../../types';
import { Search, Filter, RotateCcw } from 'lucide-react';

interface DoctorFilterProps {
  search: string;
  onSearchChange: (val: string) => void;
  selectedDepartment: string;
  onDepartmentChange: (val: string) => void;
  departments: Department[];
  specialty: string;
  onSpecialtyChange: (val: string) => void;
  onReset: () => void;
}

export const DoctorFilter: React.FC<DoctorFilterProps> = ({
  search,
  onSearchChange,
  selectedDepartment,
  onDepartmentChange,
  departments,
  specialty,
  onSpecialtyChange,
  onReset,
}) => {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Search Input */}
        <div className="relative md:col-span-2">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by doctor name or specialty..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900 focus:border-transparent transition-all placeholder:text-slate-400"
          />
        </div>

        {/* Department Select */}
        <div>
          <select
            value={selectedDepartment}
            onChange={(e) => onDepartmentChange(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900 focus:border-transparent transition-all bg-white text-slate-700"
          >
            <option value="">All Departments</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={onReset}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <RotateCcw className="w-4 h-4 text-slate-400" />
            Reset Filters
          </button>
        </div>
      </div>
    </div>
  );
};
