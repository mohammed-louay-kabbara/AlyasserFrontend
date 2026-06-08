import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUsersList, sendAdminNotification } from "../../api/notifications.api";
import toast from "react-hot-toast";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import DataTableWrapper from "../../components/ui/DataTableWrapper";

const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [showSendModal, setShowSendModal] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    body: "",
    user_ids: [] as number[],
    target_page: "home"
  });
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalSearchTerm, setModalSearchTerm] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await getUsersList();
      setUsers(response.data || []);
      setFilteredUsers(response.data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("فشل في جلب المستخدمين");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchTerm) {
      const filtered = users.filter((user) =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone?.includes(searchTerm) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchTerm, users]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.body.trim()) {
      toast.error("يرجى إدخال عنوان الإشعار والرسالة");
      return;
    }
    if (formData.user_ids.length === 0) {
      toast.error("يرجى تحديد مستخدم واحد على الأقل");
      return;
    }

    try {
      const response = await sendAdminNotification({
        title: formData.title,
        body: formData.body,
        user_ids: formData.user_ids,
        destination: formData.target_page
      });
      console.log("Notification response:", response);
      toast.success("تم إرسال الإشعار بنجاح");
      setShowSendModal(false);
      setFormData({ title: "", body: "", user_ids: [], target_page: "home" });
      setModalSearchTerm("");
    } catch (error: any) {
      console.error("Error sending notification:", error);
      // Check if the error is actually a success (some APIs return errors even on success)
      if (error.response?.status === 200 || error.response?.status === 201) {
        toast.success("تم إرسال الإشعار بنجاح");
        setShowSendModal(false);
        setFormData({ title: "", body: "", user_ids: [], target_page: "home" });
        setModalSearchTerm("");
      } else {
        toast.error("فشل في إرسال الإشعار");
      }
    }
  };

  const handleUserToggle = (userId: number) => {
    setFormData(prev => ({
      ...prev,
      user_ids: prev.user_ids.includes(userId)
        ? prev.user_ids.filter(id => id !== userId)
        : [...prev.user_ids, userId]
    }));
  };

  const handleSelectAll = () => {
    const allUserIds = users.map((user: any) => user.id);
    setFormData(prev => ({ ...prev, user_ids: allUserIds }));
  };

  const handleClearAll = () => {
    setFormData(prev => ({ ...prev, user_ids: [] }));
  };

  const selectedUsersCount = formData.user_ids.length;
  const totalUsersCount = users.length;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex-1 max-w-md">
          <input
            type="text"
            placeholder="بحث عن مستخدم..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="flex gap-2">
          <Button
            onClick={fetchUsers}
            variant="outline"
            className="flex items-center gap-2"
          >
            <span>🔄</span>
            تحديث
          </Button>
          <Button onClick={() => setShowSendModal(true)} className="bg-primary text-white">
            إرسال إشعار
          </Button>
        </div>
      </div>

      <DataTableWrapper
        data={filteredUsers}
        loading={loading}
        columns={[
          {
            key: "name",
            label: "اسم المستخدم",
            sortable: true,
            render: (value: any, row: any) => (
              <button
                onClick={() => navigate(`/notifications/${row.id}`)}
                className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
              >
                {value}
              </button>
            )
          },
          {
            key: "phone",
            label: "رقم الهاتف",
            sortable: true,
            render: (value: any) => value || "-"
          },
          {
            key: "actions",
            label: "الإجراءات",
            sortable: false,
            render: (_value: any, row: any) => (
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate(`/notifications/${row.id}`)}
              >
                عرض الإشعارات
              </Button>
            )
          }
        ]}
        serverSide={false}
        searchable={false}
        emptyMessage="لا توجد مستخدمين"
      />

      {/* Send Notification Modal */}
      {showSendModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">إرسال إشعار جديد</h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="عنوان الإشعار"
                  placeholder="أدخل عنوان الإشعار"
                  value={formData.title}
                  onChange={(value) => setFormData({ ...formData, title: value })}
                  required
                />

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">الصفحة المستهدفة</label>
                  <select
                    value={formData.target_page}
                    onChange={(e) => setFormData({ ...formData, target_page: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="home">الصفحة الرئيسية</option>
                    <option value="orders">الطلبات</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">الرسالة</label>
                  <textarea
                    placeholder="أدخل نص الإشعار"
                    value={formData.body}
                    onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    rows={4}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    المستخدمون المستهدفون ({selectedUsersCount} من {totalUsersCount})
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="بحث عن مستخدم..."
                      value={modalSearchTerm}
                      onChange={(e) => setModalSearchTerm(e.target.value)}
                      className="flex-1 px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-2">
                    <div className="flex items-center justify-between mb-2">
                      <button
                        type="button"
                        onClick={handleSelectAll}
                        className="text-sm text-primary hover:text-primary-dark"
                      >
                        تحديد الكل
                      </button>
                      <button
                        type="button"
                        onClick={handleClearAll}
                        className="text-sm text-gray-500 hover:text-gray-700"
                      >
                        إلغاء التحديد
                      </button>
                    </div>
                    {users
                      .filter(user => 
                        user.name?.toLowerCase().includes(modalSearchTerm.toLowerCase()) ||
                        user.phone?.includes(modalSearchTerm)
                      )
                      .map((user: any) => (
                        <label key={user.id} className="flex items-center space-x-reverse space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                          <input
                            type="checkbox"
                            checked={formData.user_ids.includes(user.id)}
                            onChange={() => handleUserToggle(user.id)}
                            className="w-4 h-4 text-primary"
                          />
                          <span className="text-sm text-gray-700">{user.name}</span>
                        </label>
                      ))}
                    {users.length === 0 && !loading && (
                      <div className="text-sm text-gray-500 text-center py-2">
                        لا توجد مستخدمين
                      </div>
                    )}
                    {loading && (
                      <div className="text-sm text-gray-500 text-center py-2">
                        جاري التحميل...
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex space-x-reverse space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90"
                  >
                    إرسال
                  </button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowSendModal(false);
                      setFormData({ title: "", body: "", user_ids: [], target_page: "home" });
                      setModalSearchTerm("");
                    }}
                    className="flex-1"
                  >
                    إلغاء
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
