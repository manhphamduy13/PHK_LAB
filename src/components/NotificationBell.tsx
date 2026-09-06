import { useState, useEffect, useRef } from "react";
import { Bell, Check, ExternalLink, Inbox } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { useNavigate } from "react-router-dom";

export function NotificationBell() {
  const { token, user } = useAuthStore();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    if (!token) return;
    try {
      const res = await fetch("/api/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // 30s poll
    return () => clearInterval(interval);
  }, [token]);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.readAt).length;

  const handleNotificationClick = async (notif: any) => {
    // Mark as read
    if (!notif.readAt && token) {
      try {
        await fetch(`/api/notifications/${notif.id}/read`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notif.id ? { ...n, readAt: new Date().toISOString() } : n,
          ),
        );
      } catch (err) {
        console.error("Failed to mark read:", err);
      }
    }

    setIsOpen(false);

    // Navigation logic
    const isTeacherOrAdmin =
      user?.role === "TEACHER" || user?.role === "SUPER_ADMIN";
    if (notif.resourceType === "ASSIGNMENT") {
      if (isTeacherOrAdmin) {
        navigate("/admin/classes");
      } else {
        navigate("/student/assignments");
      }
    } else if (notif.resourceType === "CLASS") {
      if (isTeacherOrAdmin) {
        navigate("/admin/classes");
      } else {
        navigate("/student/profile");
      }
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!token) return;
    const unread = notifications.filter((n) => !n.readAt);
    try {
      await Promise.all(
        unread.map((n) =>
          fetch(`/api/notifications/${n.id}/read`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
          }),
        ),
      );
      setNotifications((prev) =>
        prev.map((n) => ({
          ...n,
          readAt: n.readAt || new Date().toISOString(),
        })),
      );
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative w-10 h-10 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors"
        title="Thông báo"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-rose-500 text-white text-[11px] font-black rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border-2 border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="p-4 border-b-2 border-slate-100 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2">
              <h3 className="font-black text-slate-900 text-sm">Thông báo</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 bg-rose-100 text-rose-700 text-xs font-black rounded-full">
                  {unreadCount} mới
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" /> Đọc tất cả
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <Inbox className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="font-bold text-sm">Không có thông báo nào</p>
              </div>
            ) : (
              notifications.map((notif) => {
                const isUnread = !notif.readAt;
                return (
                  <div
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`p-4 hover:bg-slate-50 cursor-pointer transition-colors text-left flex items-start gap-3 ${
                      isUnread ? "bg-blue-50/40" : ""
                    }`}
                  >
                    <div
                      className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${
                        isUnread ? "bg-blue-500 ring-4 ring-blue-100" : "bg-transparent"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p
                          className={`text-sm truncate ${
                            isUnread
                              ? "font-black text-slate-900"
                              : "font-bold text-slate-700"
                          }`}
                        >
                          {notif.title}
                        </p>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                      </div>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {notif.message}
                      </p>
                      <p className="text-[10px] font-bold text-slate-400 mt-1">
                        {new Date(notif.createdAt).toLocaleString("vi-VN")}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
