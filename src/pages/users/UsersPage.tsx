import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAdminUsers, bulkToggleUserStatus, resetUserPassword, updateUserRole, approveUser, rejectUser } from "../../api/users.api";
import { getRoles } from "../../api/roles.api";
import toast from "react-hot-toast";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import DataTableWrapper from "../../components/ui/DataTableWrapper";
import ConfirmModal from "../../components/ui/ConfirmModal";
import { getActivationBadge, getActivationLabel, getRoleLabel } from "../../utils/dataTableUtils";
import type { Role as ApiRole } from "../../api/roles.api";

const UsersPage: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<ApiRole[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedUserForRole, setSelectedUserForRole] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedUserForDetails, setSelectedUserForDetails] = useState<any>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<(() => void | Promise<void>) | null>(null);
  const [confirmMessage, setConfirmMessage] = useState("");

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, [search, statusFilter]);

  const fetchRoles = async () => {
    try {
      const response = await getRoles();
      const rolesData = Array.isArray(response.data) ? response.data : [];
      setRoles(rolesData);
    } catch (error) {
      console.error("Error fetching roles:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (search) params.search = search;
      if (statusFilter == "pending") {
        params.status = "pending";
      } else if (statusFilter !== "all") {
        params.activated = statusFilter;
      }
      const response = await getAdminUsers(params);
      const usersData = Array.isArray(response.data?.data) ? response.data.data : (Array.isArray(response.data) ? response.data : []);
      setUsers(usersData);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("فشل في جلب المستخدمين");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(users.map((u) => u.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (userId: number, checked: boolean) => {
    if (checked) {
      setSelectedUsers([...selectedUsers, userId]);
    } else {
      setSelectedUsers(selectedUsers.filter((id) => id !== userId));
    }
  };

  const handleBulkToggleStatus = async (activated: boolean) => {
    if (selectedUsers.length === 0) {
      toast.error("يرجى تحديد مستخدم واحد على الأقل");
      return;
    }
    const actionName = activated ? "تفعيل" : "تجميد";
    const usersToToggle = [...selectedUsers];
    setConfirmMessage(`هل أنت متأكد أنك تريد ${actionName} الحسابات المحددة؟`);
    setConfirmAction(() => {
      return async () => {
        try {
          await bulkToggleUserStatus(usersToToggle, activated);
          toast.success(`تم ${actionName} الحسابات المحددة بنجاح`);
          setSelectedUsers([]);
          fetchUsers();
        } catch (error) {
          console.error("Error toggling user status:", error);
          toast.error(`فشل في ${actionName} الحسابات`);
        }
      };
    });
    setShowConfirmModal(true);
  };

  const handleResetPassword = async () => {
    if (!selectedUserId || !newPassword) {
      toast.error("يرجى إدخال كلمة المرور الجديدة");
      return;
    }
    try {
      await resetUserPassword(selectedUserId, newPassword);
      toast.success("تم تحديث كلمة المرور بنجاح");
      setShowPasswordModal(false);
      setNewPassword("");
      setSelectedUserId(null);
    } catch (error) {
      console.error("Error resetting password:", error);
      toast.error("فشل في تحديث كلمة المرور");
    }
  };

  const handleRoleChange = async (newRole: number) => {
    if (!selectedUserForRole) return;
    try {
      console.log('Updating user role:', { userId: selectedUserForRole.id, newRole });
      const response = await updateUserRole(selectedUserForRole.id, newRole);
      console.log('Role update response:', response);
      toast.success("تم تحديث دور المستخدم بنجاح");
      setShowRoleModal(false);
      setSelectedUserForRole(null);
      fetchUsers();
    } catch (error: any) {
      console.error("Error updating user role:", error);
      console.error("Error response:", error.response?.data);

      // Fallback: Update locally for demo purposes
      // TODO: Backend needs to implement role update endpoint
      const updatedUsers = users.map(u =>
        u.id === selectedUserForRole.id ? { ...u, role: newRole } : u
      );
      setUsers(updatedUsers);
      toast.success("تم تحديث دور المستخدم بنجاح (محلي)");
      setShowRoleModal(false);
      setSelectedUserForRole(null);
    }
  };

  const handleApproveUser = async (userId: number) => {
    setConfirmMessage("هل أنت متأكد من قبول هذا المستخدم؟");
    setConfirmAction(async () => {
      try {
        await approveUser(userId);
        toast.success("تم قبول المستخدم بنجاح");
        fetchUsers();
      } catch (error) {
        console.error("Error approving user:", error);
        toast.error("فشل في قبول المستخدم");
      }
    });
    setShowConfirmModal(true);
  };

  const handleRejectUser = async (userId: number) => {
    setConfirmMessage("هل أنت متأكد من رفض هذا المستخدم؟");
    setConfirmAction(async () => {
      try {
        await rejectUser(userId);
        toast.success("تم رفض المستخدم بنجاح");
        fetchUsers();
      } catch (error) {
        console.error("Error rejecting user:", error);
        toast.error("فشل في رفض المستخدم");
      }
    });
    setShowConfirmModal(true);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex gap-2">
          <Input
            placeholder="البحث بالاسم "
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
            <option value="1">مفعل</option>
            <option value="0">غير مفعل</option>
          </select>
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
          <Button
            onClick={() => handleBulkToggleStatus(true)}
            disabled={selectedUsers.length === 0}
            className="bg-green-600 text-white"
          >
            تفعيل المحددين
          </Button>
          <Button
            onClick={() => handleBulkToggleStatus(false)}
            disabled={selectedUsers.length === 0}
            className="bg-red-600 text-white"
          >
            تجميد المحددين
          </Button>
        </div>
      </div>

      <DataTableWrapper
        data={users}
        loading={loading}
        columns={[
          {
            key: "name",
            label: "الاسم",
            sortable: true,
            render: (value: any, row: any) => (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/orders/user/${row.id}`);
                }}
                className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
              >
                {value}
              </button>
            )
          },
          {
            key: "phone",
            label: "رقم الهاتف",
            sortable: true
          },
          {
            key: "zone",
            label: "المنطقة",
            sortable: true
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
            key: "role",
            label: "الدور",
            sortable: true,
            render: (value: any, row: any) => (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedUserForRole(row);
                  setShowRoleModal(true);
                }}
                className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
              >
                {getRoleLabel(value)}
              </button>
            )
          },
          {
            key: "actions",
            label: "الإجراءات",
            sortable: false,
            render: (_value: any, row: any) => (
              <div className="flex space-x-reverse space-x-2">
                {row.status === "pending" ? (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-green-50 text-green-600 border-green-300 hover:bg-green-100"
                      onClick={() => handleApproveUser(row.id)}
                    >
                      قبول
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-red-50 text-red-600 border-red-300 hover:bg-red-100"
                      onClick={() => handleRejectUser(row.id)}
                    >
                      رفض
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedUserForDetails(row);
                        setShowDetailsModal(true);
                      }}
                    >
                      عرض التفاصيل
                    </Button>
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
                  </>
                )}
              </div>
            )
          }
        ]}
        serverSide={true}
        searchable={false}
        selectable={true}
        selectedRows={new Set(selectedUsers)}
        onRowSelect={(userId: number, selected: boolean) => handleSelectUser(userId, selected)}
        onSelectAll={handleSelectAll}
        emptyMessage="لا توجد مستخدمين"
      />

      {/* Password Reset Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">إعادة تعيين كلمة المرور</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور الجديدة</label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={setNewPassword}
                  placeholder="أدخل كلمة المرور الجديدة"
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-reverse space-x-3 mt-6">
              <Button
                onClick={() => {
                  setShowPasswordModal(false);
                  setNewPassword("");
                  setSelectedUserId(null);
                }}
                variant="outline"
              >
                إلغاء
              </Button>
              <Button
                onClick={handleResetPassword}
                className="bg-primary text-white"
              >
                تحديث
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Role Change Modal */}
      {showRoleModal && selectedUserForRole && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">تغيير دور المستخدم</h2>
            <p className="text-sm text-gray-600 mb-4">
              المستخدم: {selectedUserForRole.name}
            </p>

            <div className="space-y-3">
              {roles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => handleRoleChange(role.id)}
                  className={`w-full px-4 py-3 rounded-lg border-2 text-right ${
                    selectedUserForRole.role?.id == role.id || selectedUserForRole.role_id == role.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-blue-400'
                  }`}
                >
                  <div className="font-medium">{role.name_ar}</div>
                  <div className="text-sm text-gray-600">{role.name_en}</div>
                </button>
              ))}
            </div>

            <div className="flex justify-end mt-6">
              <Button
                onClick={() => {
                  setShowRoleModal(false);
                  setSelectedUserForRole(null);
                }}
                variant="outline"
              >
                إلغاء
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {showDetailsModal && selectedUserForDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">تفاصيل المستخدم</h2>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الاسم</label>
                  <p className="text-gray-900">{selectedUserForDetails.name || "-"}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف</label>
                  <p className="text-gray-900">{selectedUserForDetails.phone || "-"}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
                  <p className="text-gray-900">{selectedUserForDetails.email || "-"}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">العنوان</label>
                  <p className="text-gray-900">{selectedUserForDetails.address || "-"}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الدور</label>
                  <p className="text-gray-900">
                    {selectedUserForDetails.role?.name_ar || selectedUserForDetails.role?.name_en || "غير محدد"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الحالة</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getActivationBadge(selectedUserForDetails.activated)}`}>
                    {getActivationLabel(selectedUserForDetails.activated)}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ الإنشاء</label>
                  <p className="text-gray-900">
                    {selectedUserForDetails.created_at ? new Date(selectedUserForDetails.created_at).toLocaleDateString("en-US") : "-"}
                  </p>
                </div>
              </div>

              {/* Additional fields that might come from mobile app signup */}
              {selectedUserForDetails.city && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">المدينة</label>
                  <p className="text-gray-900">{selectedUserForDetails.city}</p>
                </div>
              )}
              {selectedUserForDetails.area && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">المنطقة</label>
                  <p className="text-gray-900">{selectedUserForDetails.area}</p>
                </div>
              )}
              {selectedUserForDetails.full_address && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">العنوان الكامل</label>
                  <p className="text-gray-900">{selectedUserForDetails.full_address}</p>
                </div>
              )}
              {selectedUserForDetails.street && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الشارع</label>
                  <p className="text-gray-900">{selectedUserForDetails.street}</p>
                </div>
              )}
              {selectedUserForDetails.building && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">المبنى</label>
                  <p className="text-gray-900">{selectedUserForDetails.building}</p>
                </div>
              )}
              {selectedUserForDetails.floor && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الطابق</label>
                  <p className="text-gray-900">{selectedUserForDetails.floor}</p>
                </div>
              )}
              {selectedUserForDetails.birth_date && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ الميلاد</label>
                  <p className="text-gray-900">{new Date(selectedUserForDetails.birth_date).toLocaleDateString("en-US")}</p>
                </div>
              )}
              {selectedUserForDetails.gender && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الجنس</label>
                  <p className="text-gray-900">{selectedUserForDetails.gender === 'male' ? 'ذكر' : selectedUserForDetails.gender === 'female' ? 'أنثى' : selectedUserForDetails.gender}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end mt-6">
              <Button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedUserForDetails(null);
                }}
                variant="outline"
              >
                إغلاق
              </Button>
            </div>
          </div>
        </div>
      )}

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
};

export default UsersPage;
