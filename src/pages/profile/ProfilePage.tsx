import React, { useState } from "react";
import { useAuthStore } from "../../store/authStore";
import { useMutation } from "@tanstack/react-query";
import { updateUserProfile } from "../../api/users.api";
import toast from "react-hot-toast";

const ProfilePage: React.FC = () => {
  const { user, setAuth } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    address: user?.address || "",
    old_password: "",
    new_password: "",
    confirm_password: "",
  });


  const getRoleName = (role: any): string => {
    if (!role) return "غير محدد";
    
    // Handle role object
    if (typeof role === 'object' && role !== null) {
      return role.name_ar || role.name_en || "غير محدد";
    }
    
    // Handle role as string or number
    const roleMap: Record<string, string> = {
      admin: "مدير النظام",
      manager: "مدير",
      warehouse_manager: "مدير المستودع",
      driver: "سائق",
      customer: "عميل",
      "1": "مدير النظام",
      "2": "مدير",
      "3": "مدير المستودع",
      "4": "سائق",
      "5": "عميل",
    };
    return roleMap[role.toString()] || role.toString() || "غير محدد";
  };

  const getStatusName = (status: any): string => {
    const statusMap: Record<string, string> = {
      active: "نشط",
      inactive: "غير نشط",
      pending: "قيد الانتظار",
      rejected: "مرفوض",
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: any): string => {
    const colorMap: Record<string, string> = {
      active: "bg-green-100 text-green-800",
      inactive: "bg-gray-100 text-gray-800",
      pending: "bg-yellow-100 text-yellow-800",
      rejected: "bg-red-100 text-red-800",
    };
    return colorMap[status] || "bg-gray-100 text-gray-800";
  };

  const updateProfileMutation = useMutation({
    mutationFn: (data: any) => updateUserProfile(data),
    onSuccess: (response) => {
      const apiUser = response.data?.user || response.data?.data || response.data;
      const updatedUser = {
        ...user,
        ...(typeof apiUser === "object" && apiUser !== null ? apiUser : {}),
        name: formData.name,
 
        phone: formData.phone,
        address: formData.address,
      };
      const token = localStorage.getItem("auth_token");
      if (token) {
        setAuth(updatedUser, token);
      }
      setFormData({
        name: updatedUser.name || "",

        phone: updatedUser.phone || "",
        address: updatedUser.address || "",
        old_password: "",
        new_password: "",
        confirm_password: "",
      });
      toast.success("تم تحديث الملف الشخصي بنجاح");
      setIsEditing(false);
    },
    onError: () => {
      toast.error("فشل تحديث الملف الشخصي");
    },
  });

  const handleSave = () => {

    
    // Password validation
    if (formData.new_password) {
      if (!formData.old_password) {
        toast.error("يرجى إدخال كلمة المرور القديمة لتغيير كلمة المرور");
        return;
      }
      if (formData.new_password.length < 6) {
        toast.error("كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل");
        return;
      }
      if (formData.new_password !== formData.confirm_password) {
        toast.error("كلمة المرور الجديدة وتأكيد كلمة المرور غير متطابقين");
        return;
      }
    }
    
    updateProfileMutation.mutate(formData);
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || "",

      phone: user?.phone || "",
      address: user?.address || "",
      old_password: "",
      new_password: "",
      confirm_password: "",
    });
    setIsEditing(false);
  };

  const handleEdit = () => {
    setFormData({
      name: user?.name || "",

      phone: user?.phone || "",
      address: user?.address || "",
      old_password: "",
      new_password: "",
      confirm_password: "",
    });
    setIsEditing(true);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">لا توجد بيانات مستخدم</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div></div>
        {!isEditing ? (
          <button
            onClick={handleEdit}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            تعديل الملف
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              إلغاء
            </button>
            <button
              onClick={handleSave}
              disabled={updateProfileMutation.isPending}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {updateProfileMutation.isPending ? "جاري الحفظ..." : "حفظ التغييرات"}
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="bg-gradient-to-br from-red-600 to-red-400 p-8 text-center">
              <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center text-red-600 text-5xl font-bold shadow-lg mx-auto mb-4">
                {user.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <h2 className="text-2xl font-bold text-white">{user.name}</h2>

            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">الحالة</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(user.status)}`}>
                    {getStatusName(user.status)}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">الدور</span>
                  <span className="text-sm font-medium text-gray-900">{getRoleName(user.role)}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">تاريخ التسجيل</span>
                  <span className="text-sm font-medium text-gray-900">
                    {user.created_at ? new Date(user.created_at).toLocaleDateString('ar-SY', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      numberingSystem: 'latn'
                    }) : "غير محدد"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Details Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">معلومات المستخدم</h3>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">الاسم الكامل</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                    />
                  ) : (
                    <p className="text-lg font-medium text-gray-900">{user.name}</p>
                  )}
                </div>

 

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">رقم الهاتف</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                    />
                  ) : (
                    <p className="text-lg font-medium text-gray-900">{user.phone || "غير محدد"}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">العنوان</label>
                  {isEditing ? (
                    <textarea
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none resize-none"
                    />
                  ) : (
                    <p className="text-lg font-medium text-gray-900">{user.address || "غير محدد"}</p>
                  )}
                </div>

                {/* Password Change Section - Only show in edit mode */}
                {isEditing && (
                  <>
                    <div className="border-t pt-6 mt-6">
                      <h4 className="text-md font-semibold text-gray-900 mb-4">تغيير كلمة المرور</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">كلمة المرور القديمة</label>
                          <input
                            type="password"
                            value={formData.old_password}
                            onChange={(e) => setFormData({ ...formData, old_password: e.target.value })}
                            placeholder="أدخل كلمة المرور القديمة"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">كلمة المرور الجديدة</label>
                          <input
                            type="password"
                            value={formData.new_password}
                            onChange={(e) => setFormData({ ...formData, new_password: e.target.value })}
                            placeholder="أدخل كلمة المرور الجديدة (6 أحرف على الأقل)"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">تأكيد كلمة المرور الجديدة</label>
                          <input
                            type="password"
                            value={formData.confirm_password}
                            onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                            placeholder="أعد إدخال كلمة المرور الجديدة"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
