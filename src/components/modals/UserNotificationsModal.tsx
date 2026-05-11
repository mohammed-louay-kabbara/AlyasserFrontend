import React from "react";

interface Notification {
  id: number;
  title: string;
  body: string;
  created_at: string;
  read_at?: string;
}

interface UserNotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  userName: string;
  userId: number;
}

const UserNotificationsModal: React.FC<UserNotificationsModalProps> = ({
  isOpen,
  onClose,
  notifications,
  userName,
  userId
}) => {
  if (!isOpen) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              إشعارات المستخدم: {userName}
            </h2>
            <p className="text-sm text-gray-500 mt-1">المعرف: #{userId}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {notifications.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              لا توجد إشعارات لهذا المستخدم
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                    <span className="text-xs text-gray-500">
                      {formatDate(notification.created_at)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{notification.body}</p>
                  {notification.read_at && (
                    <div className="mt-2 text-xs text-green-600">
                      تم القراءة: {formatDate(notification.read_at)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserNotificationsModal;
