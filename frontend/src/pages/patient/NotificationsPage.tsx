import React, { useState, useEffect } from 'react';
import { notificationService } from '../../services/notificationService';
import { NotificationItem } from '../../types';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { Button } from '../../components/common/Button';
import { Bell, CheckCheck, Clock, CheckCircle } from 'lucide-react';
import { formatDateTime } from '../../utils/format';

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchNotifications = () => {
    setIsLoading(true);
    notificationService.getNotifications()
      .then(setNotifications)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    await notificationService.markAllRead();
    fetchNotifications();
  };

  const handleMarkRead = async (id: string) => {
    await notificationService.markAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  return (
    <DashboardLayout
      title="Notifications & Alerts"
      subtitle="Real-time updates regarding bookings, schedule changes, and hospital announcements"
      actions={
        notifications.some((n) => !n.read) && (
          <Button
            variant="outline"
            size="sm"
            leftIcon={<CheckCheck className="w-4 h-4 text-teal-600" />}
            onClick={handleMarkAllRead}
          >
            Mark All as Read
          </Button>
        )
      }
    >
      <div className="max-w-4xl mx-auto space-y-4">
        {isLoading ? (
          <LoadingSpinner message="Checking notifications..." />
        ) : notifications.length === 0 ? (
          <EmptyState
            title="No notifications"
            description="You are completely caught up! New alerts regarding appointment confirmations and clinical updates will appear here."
            icon={<Bell className="w-8 h-8" />}
          />
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => !n.read && handleMarkRead(n.id)}
                className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex items-start justify-between gap-4 ${
                  !n.read
                    ? 'bg-teal-50/40 border-teal-200 shadow-sm'
                    : 'bg-white border-slate-150 text-slate-700'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {!n.read && (
                      <span className="w-2 h-2 rounded-full bg-teal-600 shrink-0" />
                    )}
                    <h4 className="text-sm font-extrabold text-navy-950">{n.title}</h4>
                    <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                      {n.type.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1 pt-1">
                    <Clock className="w-3 h-3" />
                    {formatDateTime(n.createdAt)}
                  </span>
                </div>

                {!n.read && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMarkRead(n.id);
                    }}
                    className="text-xs font-bold text-teal-700 hover:text-teal-800 p-1"
                  >
                    Mark read
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
