import React, { useState, useEffect } from "react";
import { getAdminStaff, createStaff, updateStaff, deleteStaff } from "../../api/staff.api";
import { getRoles } from "../../api/roles.api";
import toast from "react-hot-toast";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import DataTableWrapper from "../../components/ui/DataTableWrapper";
import ConfirmModal from "../../components/ui/ConfirmModal";
import { PermissionGuard } from "../../components/auth/PermissionGuard";
import { resetUserPassword } from "../../api/users.api";
import { getActivationBadge, getActivationLabel, getRoleLabel } from "../../utils/dataTableUtils";
import type { Role as ApiRole } from "../../api/roles.api";

const StaffPage: React.FC = () => {
  const [search,setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter] = useState("all");
  const [staff, setStaff] = useState<any[]>([]);
  const [roles, setRoles] = useState<ApiRole[]>([]);
  const [loading, setLoading] = useState(false);
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    zone: "",
    role_id: 2,
    activated: 1
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formErrorMessage, setFormErrorMessage] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<(() => void | Promise<void>) | null>(null);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalStaff, setTotalStaff] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [newPassword, setNewPassword] = useState("");

  const toArabicValidationMessage = (message: string, fieldKey?: string) => {
    if (!message) return "";
    if (/[\u0600-\u06FF]/.test(message)) return message;

    const fieldMap: Record<string, string> = {
      name: "الاسم",
      phone: "رقم الهاتف",
      address: "العنوان",
      zone: "المنطقة",
      role_id: "الدور",
      "role id": "الدور",
      activated: "الحالة",
    };

    const fieldLabel = fieldKey ? (fieldMap[fieldKey] || fieldMap[fieldKey.replace(/_/g, " ")] || fieldKey) : "";

    if (message === "The phone has already been taken.") return "رقم الهاتف مستخدم مسبقاً.";
    if (message === "The name has already been taken.") return "الاسم مستخدم مسبقاً.";

    const requiredMatch = message.match(/^The (.+) field is required\.$/);
    if (requiredMatch) {
      const key = requiredMatch[1].trim();
      const label = fieldMap[key] || key;
      return `حقل ${label} مطلوب.`;
    }

    const uniqueMatch = message.match(/^The (.+) has already been taken\.$/);
    if (uniqueMatch) {
      const key = uniqueMatch[1].trim();
      const label = fieldMap[key] || key;
      return `حقل ${label} مستخدم مسبقاً.`;
    }

    const invalidMatch = message.match(/^The selected (.+) is invalid\.$/);
    if (invalidMatch) {
      const key = invalidMatch[1].trim();
      const label = fieldMap[key] || key;
      return `${label} المحدد غير صالح.`;
    }

    const minMatch = message.match(/^The (.+) must be at least (\d+) characters\.$/);
    if (minMatch) {
      const key = minMatch[1].trim();
      const min = minMatch[2];
      const label = fieldMap[key] || key;
      return `حقل ${label} يجب ألا يقل عن ${min} محارف.`;
    }

    const numericMatch = message.match(/^The (.+) must be a number\.$/);
    if (numericMatch) {
      const key = numericMatch[1].trim();
      const label = fieldMap[key] || key;
      return `حقل ${label} يجب أن يكون رقماً.`;
    }

    if (message === "Unauthorized") return "غير مصرح";
    if (message === "Unauthenticated.") return "غير مسجل دخول";

    if (fieldLabel) return `يوجد خطأ في حقل ${fieldLabel}.`;
    return "حدث خطأ، يرجى المحاولة مرة أخرى.";
  };

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetchStaff();
    fetchRoles();
  }, [debouncedSearch, statusFilter, currentPage, rowsPerPage]);

  const fetchRoles = async () => {
    try {
      const response = await getRoles();
      const rolesData = Array.isArray(response.data) ? response.data : [];
      setRoles(rolesData);
    } catch (error) {
      console.error("Error fetching roles:", error);
    }
  };

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const params: any = {
        search: debouncedSearch || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        page: currentPage,
        per_page: rowsPerPage
      };
      const response = await getAdminStaff(params);
      const staffData = response.data?.data?.data || response.data?.data || [];
      setStaff(staffData);
      setTotalPages(response.data?.data?.last_page || 1);
      setTotalStaff(response.data?.data?.total || 0);
    } catch (error) {
      console.error("Error fetching staff:", error);
      toast.error("فشل في جلب الموظفين");
    } finally {
      setLoading(false);
    }
  };

  const handleAddStaff = () => {
    setEditingStaff(null);
    setFormErrors({});
    setFormErrorMessage("");
    setFormData({
      name: "",
      phone: "",
      address: "",
      zone: "",
      role_id: 2,
      activated: 1
    });
    setShowStaffModal(true);
  };

  const handleEditStaff = (staffMember: any) => {
    setEditingStaff(staffMember);
    setFormErrors({});
    setFormErrorMessage("");
    setFormData({
      name: staffMember.name || "",
      phone: staffMember.phone || "",
      address: staffMember.address || "",
      zone: staffMember.zone || "",
      role_id: staffMember.role_id || 2,
      activated: staffMember.activated || 1
    });
    setShowStaffModal(true);
  };

  const handleSaveStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    setFormErrorMessage("");

    const nextErrors: Record<string, string> = {};
    if (!formData.name?.trim()) nextErrors.name = "الاسم مطلوب";
    if (!formData.phone?.trim()) nextErrors.phone = "رقم الهاتف مطلوب";
    if (Object.keys(nextErrors).length > 0) {
      setFormErrors(nextErrors);
      setFormErrorMessage("يرجى تصحيح الحقول التالية");
      return;
    }

    try {
      if (editingStaff) {
        await updateStaff(editingStaff.id, formData);
        toast.success("تم تحديث الموظف بنجاح");
      } else {
        await createStaff(formData);
        toast.success("تم إضافة الموظف بنجاح");
      }
      setFormErrors({});
      setFormErrorMessage("");
      setShowStaffModal(false);
      fetchStaff();
    } catch (error: any) {
      console.error("Error saving staff:", error);
      const rawMessage = error?.response?.data?.message || "";
      const message = rawMessage ? toArabicValidationMessage(rawMessage) : "فشل في حفظ الموظف";
      const errors = error?.response?.data?.errors;
      if (errors && typeof errors === "object") {
        const next: Record<string, string> = {};
        Object.keys(errors).forEach((key) => {
          const v = errors[key];
          if (Array.isArray(v) && v.length > 0) next[key] = toArabicValidationMessage(String(v[0]), key);
          else if (typeof v === "string") next[key] = toArabicValidationMessage(v, key);
        });
        setFormErrors(next);
      }
      setFormErrorMessage(message);
      toast.error(message);
    }
  };

  const handleDeleteStaff = (id: number) => {
    setConfirmMessage("هل أنت متأكد أنك تريد حذف هذا الموظف؟");
    setConfirmAction(() => {
      return async () => {
        try {
          await deleteStaff(id);
          toast.success("تم حذف الموظف بنجاح");
          fetchStaff();
        } catch (error) {
          console.error("Error deleting staff:", error);
          toast.error("فشل في حذف الموظف");
        }
      };
    });
    setShowConfirmModal(true);
  };

  const handleResetPassword = async (password?: string) => {
    const finalPassword = password || newPassword;
    if (!selectedUserId || !finalPassword) {
      toast.error("يرجى إدخال كلمة المرور الجديدة");
      return;
    }
    try {
      await resetUserPassword(selectedUserId, finalPassword);
      toast.success("تم تحديث كلمة المرور بنجاح");

      const updatedStaff = staff.map((s) =>
        s.id === selectedUserId ? { ...s, force_password_change: false } : s
      );
      setStaff(updatedStaff);

      setShowPasswordModal(false);
      setNewPassword("");
      setSelectedUserId(null);
    } catch (error) {
      console.error("Error resetting staff password:", error);
      toast.error("فشل في تحديث كلمة المرور");
    }
  };

  const handlePasswordResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleResetPassword("12345678");
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="البحث بالاسم أو الهاتف..."
            value={search}
            onChange={setSearch}
            className="w-64"
          />

        </div>
        {/* <div className="flex gap-2">
          <Input
            type="text"
            placeholder="البحث بالاسم أو الهاتف..."
            value={search}
            onChange={setSearch}
            className="w-64"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">جميع الحالات</option>
            <option value="pending">في الانتظار</option>
            <option value="1">نشط</option>
            <option value="0">غير نشط</option>
          </select>
        </div> */}
        <div className="flex gap-2">
          <Button
            onClick={fetchStaff}
            variant="outline"
            className="flex items-center gap-2"
          >
            <span>🔄</span>
            تحديث
          </Button>
          <Button onClick={handleAddStaff} className="bg-primary text-white">
            إضافة موظف جديد
          </Button>
        </div>
      </div>


      <DataTableWrapper
        data={staff}
        loading={loading}
        columns={[
          {
            key: "user_number",
            label: "المعرف",
            sortable: true,
            render: (value: any) => `${value}`
          },
          {
            key: "name",
            label: "الاسم",
            sortable: true
          },
          {
            key: "phone",
            label: "الهاتف",
            sortable: true
          },
          {
            key: "role_id",
            label: "الدور",
            sortable: true,
            render: (value: any, row: any) => getRoleLabel(row?.role ?? value)
          },
          {
            key: "zone",
            label: "المنطقة",
            sortable: true,
            render: (value: any) => value || "-"
          },
          {
            key: "activated",
            label: "الحالة",
            sortable: true,
            render: (value: any, row: any) => (
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getActivationBadge(value, row.status)}`}>
                {getActivationLabel(value, row.status)}
              </span>
            )
          },
                    {
            key: "actions",
            label: "الإجراءات",
            sortable: false,
            render: (_: any, row: any) => (
              <div className="flex space-x-reverse space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEditStaff(row)}
                >
                  تعديل
                </Button>
                <PermissionGuard permissions="manage_users">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedUserId(row.id);
                      setShowPasswordModal(true);
                    }}
                  >
                    إعادة تعيين كلمة المرور
                  </Button>
                </PermissionGuard>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => handleDeleteStaff(row.id)}
                >
                  حذف
                </Button>
              </div>
            )
          }
        ]}
        serverSide={true}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalStaff}
        onPageChange={setCurrentPage}
        onRowsPerPageChange={(value: number) => {
          setRowsPerPage(value);
          setCurrentPage(1);
        }}
        rowsPerPage={rowsPerPage}
        searchable={false}
        emptyMessage="لا يوجد موظفين"
      />

      {/* Password Reset Confirmation Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">تأكيد إعادة تعيين كلمة المرور</h2>

            <form onSubmit={handlePasswordResetSubmit} className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-yellow-800">سيتم تعيين كلمة المرور الافتراضية</p>
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-600">هل أنت متأكد من أنك تريد إعادة تعيين كلمة المرور لهذا المستخدم؟</p>

              <div className="flex justify-end space-x-reverse space-x-3 mt-6">
                <Button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setSelectedUserId(null);
                  }}
                  variant="outline"
                >
                  إلغاء
                </Button>
                <Button
                  type="submit"
                  className="bg-red-600 text-white hover:bg-red-700"
                >
                  تأكيد إعادة التعيين
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add/Edit Staff Modal */}
      {showStaffModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold mb-4">
              {editingStaff ? "تعديل الموظف" : "إضافة موظف جديد"}
            </h2>
            <form onSubmit={handleSaveStaff} className="space-y-4">
              {formErrorMessage && (
                <div className="p-3 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm">
                  {formErrorMessage}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الاسم</label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(value) => setFormData({ ...formData, name: value })}
                  placeholder="الاسم الكامل"
                  error={formErrors.name}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الهاتف</label>
                <Input
                  type="text"
                  value={formData.phone}
                  onChange={(value) => setFormData({ ...formData, phone: value })}
                  placeholder="رقم الهاتف"
                  error={formErrors.phone}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">العنوان</label>
                <Input
                  type="text"
                  value={formData.address}
                  onChange={(value) => setFormData({ ...formData, address: value })}
                  placeholder="العنوان"
                  error={formErrors.address}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">المنطقة</label>
                <Input
                  type="text"
                  value={formData.zone}
                  onChange={(value) => setFormData({ ...formData, zone: value })}
                  placeholder="المنطقة"
                  error={formErrors.zone}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الدور</label>
                <select
                  value={formData.role_id}
                  onChange={(e) => setFormData({ ...formData, role_id: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name_ar}
                    </option>
                  ))}
                </select>
                {formErrors.role_id && (
                  <p className="text-sm text-red-600 mt-1">{formErrors.role_id}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الحالة</label>
                <select
                  value={formData.activated}
                  onChange={(e) => setFormData({ ...formData, activated: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value={1}>نشط</option>
                  <option value={0}>غير نشط</option>
                </select>
                {formErrors.activated && (
                  <p className="text-sm text-red-600 mt-1">{formErrors.activated}</p>
                )}
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowStaffModal(false);
                    setFormErrors({});
                    setFormErrorMessage("");
                  }}
                >
                  إلغاء
                </Button>
                <Button type="submit" className="bg-primary text-white">
                  حفظ
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        title="تأكيد"
        message={confirmMessage}
        onConfirm={() => {
          if (confirmAction) {
            confirmAction();
          }
          setShowConfirmModal(false);
        }}
        onClose={() => setShowConfirmModal(false)}
      />
    </div>
  );
};

export default StaffPage;
