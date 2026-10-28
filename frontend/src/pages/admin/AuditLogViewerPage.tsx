import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { AuditLogItem } from '../../types';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { FileText, Clock, Search } from 'lucide-react';

export const AuditLogViewerPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');

  useEffect(() => {
    setIsLoading(true);
    adminService.getAuditLogs()
      .then(setLogs)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const filtered = logs.filter(
    (l) =>
      !search ||
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.actorEmail.toLowerCase().includes(search.toLowerCase()) ||
      l.details.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout
      title="Security & Operational Audit Logs"
      subtitle="Immutable audit trail of authentication events, slot reservations, and clinical records modification"
    >
      <div className="space-y-6">
        <div className="bg-white p-4 rounded-2xl border border-slate-150 flex items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search audit trail..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900"
            />
          </div>
          <span className="text-xs font-bold text-slate-400">Total Entries: {logs.length}</span>
        </div>

        {isLoading ? (
          <LoadingSpinner message="Retrieving security audit logs..." />
        ) : (
          <div className="bg-white rounded-3xl border border-slate-150 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-150 text-slate-400 uppercase tracking-wider font-bold">
                  <tr>
                    <th className="py-3.5 px-6">Timestamp</th>
                    <th className="py-3.5 px-6">User / Actor</th>
                    <th className="py-3.5 px-6">Action</th>
                    <th className="py-3.5 px-6">Resource</th>
                    <th className="py-3.5 px-6">Outcome</th>
                    <th className="py-3.5 px-6">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filtered.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-6 text-slate-500 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-6 font-bold text-navy-950">{log.actorEmail}</td>
                      <td className="py-3.5 px-6">
                        <span className="font-extrabold text-teal-800 bg-teal-50 px-2 py-0.5 rounded">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-slate-500">{log.resourceType}</td>
                      <td className="py-3.5 px-6">
                        <span
                          className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded ${
                            log.outcome === 'SUCCESS' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {log.outcome}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-slate-600 max-w-sm truncate">{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
