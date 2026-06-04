import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getUserNotifications, markNotificationAsRead, deleteNotification } from "../../api/notifications.api";
import Button from "../../components/ui/Button";
import toast from "react-hot-toast";
import DataTable from "../../components/ui/DataTable";
import ConfirmModal from "../../components/ui/ConfirmModal";

export default function UserNotificationsPage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState("");
  const [filter, setFilter] = useState<"all" | "read" | "unread">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [totalCount, setTotalCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<(() => void | Promise<void>) | null>(null);
  const [confirmMessage, setConfirmMessage] = useState("");

  useEffect(() => {
    if (userId) {
      fetchUserNotifications(filter);
    }
  }, [userId, filter]);

  const fetchUserNotifications = async (status: "all" | "read" | "unread" = "all") => {
    setLoading(true);
    try {
      const response = await getUserNotifications(Number(userId), status);
      setNotifications(response.data.notifications);
      setTotalCount(response.data.total);
      setUnreadCount(response.data.unread_count);

      if (response.data.notifications.length > 0 && response.data.notifications[0].user) {
        setUserName(response.data.notifications[0].user.name);
      }
    } catch (error) {
      console.error("Error fetching user notifications:", error);
      toast.error("فشل في جلب إشعارات المستخدم");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await markNotificationAsRead(notificationId);
      toast.success("تم تحديد الإشعار كمقروء");
      fetchUserNotifications(filter);
    } catch (error) {
      console.error("Error marking notification as read:", error);
      toast.error("فشل في تحديث حالة الإشعار");
    }
  };

  const handleDelete = async (notificationId: number) => {
    setConfirmMessage("هل أنت متأكد من حذف هذا الإشعار؟");
    setConfirmAction(() => {
      return async () => {
        try {
          await deleteNotification(notificationId);
          toast.success("تم حذف الإشعار بنجاح");
          fetchUserNotifications(filter);
        } catch (error) {
          console.error("Error deleting notification:", error);
          toast.error("فشل في حذف الإشعار");
        }
      };
    });
    setShowConfirmModal(true);
  };

  const getReadBadge = (isRead: number | boolean) => {
    return isRead === 1 || isRead === true
      ? "bg-gray-100 text-gray-800"
      : "bg-blue-100 text-blue-800";
  };

  const getReadLabel = (isRead: number | boolean) => {
    return isRead == 1 || isRead == true ? "مقروء" : "غير مقروء";
  };

  const filteredNotifications = notifications.filter((notification) => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        notification.title?.toLowerCase().includes(searchLower) ||
        notification.body?.toLowerCase().includes(searchLower)
      );
    }

    return true;
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex gap-2">
          <p className="text-gray-600">{userName}</p>
          <span className="text-sm text-gray-500">
            جميع الإشعارات ({totalCount}) - غير مقروء ({unreadCount})
          </span>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate("/notifications")} variant="outline">
            العودة للإشعارات
          </Button>
          <Button
            onClick={() => fetchUserNotifications(filter)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <span>🔄</span>
            تحديث
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex-1 max-w-md">
          <input
            type="text"
            placeholder="بحث في الإشعارات..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={filter === "all" ? "primary" : "outline"}
            onClick={() => setFilter("all")}
          >
            الكل
          </Button>
          <Button
            variant={filter === "unread" ? "primary" : "outline"}
            onClick={() => setFilter("unread")}
          >
            غير مقروء
          </Button>
          <Button
            variant={filter === "read" ? "primary" : "outline"}
            onClick={() => setFilter("read")}
          >
            مقروء
          </Button>
        </div>
      </div>

      <DataTable
        data={filteredNotifications}
        loading={loading}
        columns={[
          {
            key: "title",
            label: "العنوان",
            sortable: true
          },
          {
            key: "body",
            label: "المحتوى",
            sortable: false,
            render: (value: any) => (
              <div className="text-sm text-gray-900 max-w-md truncate">
                {value}
              </div>
            )
          },
          {
            key: "created_at",
            label: "التاريخ",
            sortable: true,
            render: (value: any) => new Date(value).toLocaleDateString("en-US", { timeZone: "UTC" })
          },
          {
            key: "is_read",
            label: "الحالة",
            sortable: true,
            render: (value: any) => (
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getReadBadge(value)}`}>
                {getReadLabel(value)}
              </span>
            )
          },
          {
            key: "actions",
            label: "الإجراءات",
            sortable: false,
            render: (_value: any, row: any) => (
              <div className="flex gap-2">
                {row.is_read === 0 && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleMarkAsRead(row.id)}
                  >
                    تحديد كمقروء
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-red-50 text-red-600 border-red-300 hover:bg-red-100"
                  onClick={() => handleDelete(row.id)}
                >
                  حذف
                </Button>
              </div>
            )
          }
        ]}
        serverSide={false}
        searchable={false}
        emptyMessage="لا توجد إشعارات لهذا المستخدم"
      />

      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={() => confirmAction?.()}
        title="تأكيد"
        message={confirmMessage}
        type="danger"
      />
    </div>
  );
}
