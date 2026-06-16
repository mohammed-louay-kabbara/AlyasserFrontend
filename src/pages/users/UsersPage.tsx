import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAdminUsers, bulkToggleUserStatus, resetUserPassword, approveUser, rejectUser } from "../../api/users.api";
import toast from "react-hot-toast";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import DataTableWrapper from "../../components/ui/DataTableWrapper";
import ConfirmModal from "../../components/ui/ConfirmModal";
import { getActivationBadge, getActivationLabel } from "../../utils/dataTableUtils";
import { PermissionGuard } from "../../components/auth/PermissionGuard";

const UsersPage: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [users, setUsers] = useState<any[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [newPassword, setNewPassword] = useState("");
    const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedUserForDetails, setSelectedUserForDetails] = useState<any>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<(() => void | Promise<void>) | null>(null);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    fetchUsers();
  }, [search, statusFilter, currentPage, rowsPerPage]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params: any = {
        per_page: rowsPerPage,
        page: currentPage
      };
      if (search) params.search = search;
      if (statusFilter !== "all") {
        params.status = statusFilter;
      }
      const response = await getAdminUsers(params);
      const usersData = Array.isArray(response.data?.data?.data) ? response.data.data.data : (Array.isArray(response.data?.data) ? response.data.data : []);
      setUsers(usersData);
      setTotalPages(response.data?.data?.last_page || 1);
      setTotalUsers(response.data?.data?.total || 0);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("فشل في جلب المستخدمين");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      // Add current page users to existing selections (don't replace)
      const currentPageIds = users.map((u) => u.id);
      setSelectedUsers(prev => [...new Set([...prev, ...currentPageIds])]);
    } else {
      // Remove current page users from selections (don't clear all)
      const currentPageIds = new Set(users.map((u) => u.id));
      setSelectedUsers(prev => prev.filter(id => !currentPageIds.has(id)));
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
          // console.log("Toggling status for users:", usersToToggle);
          console.log("Activated:", activated);
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

  const handleResetPassword = async (password?: string) => {
    const finalPassword = password || newPassword;
    if (!selectedUserId || !finalPassword) {
      toast.error("يرجى إدخال كلمة المرور الجديدة");
      return;
    }
    try {
      await resetUserPassword(selectedUserId, finalPassword);
      toast.success("تم تحديث كلمة المرور بنجاح");

      // Backend will set force_password_change to false when password is reset
      // Update local user list to reflect this change
      const updatedUsers = users.map(user =>
        user.id === selectedUserId
          ? { ...user, force_password_change: false }
          : user
      );
      setUsers(updatedUsers);



      setShowPasswordModal(false);
      setNewPassword("");
      setSelectedUserId(null);
    } catch (error) {
      console.error("Error resetting password:", error);
      toast.error("فشل في تحديث كلمة المرور");
    }
  };

  const handlePasswordResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleResetPassword("12345678");
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
            <option value="active">نشط</option>
            <option value="pending">معلق</option>
            <option value="frozen">مجمد</option>
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
          <PermissionGuard permissions="manage_users">
            <Button
              onClick={() => handleBulkToggleStatus(true)}
              disabled={selectedUsers.length === 0}
              className="bg-green-600 text-white"
            >
              تفعيل المحددين
            </Button>
          </PermissionGuard>
          <PermissionGuard permissions="manage_users">
            <Button
              onClick={() => handleBulkToggleStatus(false)}
              disabled={selectedUsers.length === 0}
              className="bg-red-600 text-white"
            >
              تجميد المحددين
            </Button>
          </PermissionGuard>
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
                  navigate(`/orders/user/${row.user_number}`);
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
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getActivationBadge(value, row.Forbidden)}`}>
                {getActivationLabel(value, row.Forbidden)}
              </span>
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
                    <PermissionGuard permissions="manage_users">
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-green-50 text-green-600 border-green-300 hover:bg-green-100"
                        onClick={() => handleApproveUser(row.id)}
                      >
                        قبول
                      </Button>
                    </PermissionGuard>
                    <PermissionGuard permissions="manage_users">
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-red-50 text-red-600 border-red-300 hover:bg-red-100"
                        onClick={() => handleRejectUser(row.id)}
                      >
                        رفض
                      </Button>
                    </PermissionGuard>
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
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalUsers}
        rowsPerPage={rowsPerPage}
        onPageChange={(page) => setCurrentPage(page)}
        onRowsPerPageChange={(rows) => {
          setRowsPerPage(rows);
          setCurrentPage(1);
        }}
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

              <p className="text-sm text-gray-600">
                هل أنت متأكد من أنك تريد إعادة تعيين كلمة المرور لهذا المستخدم؟
              </p>

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
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getActivationBadge(selectedUserForDetails.activated, selectedUserForDetails.Forbidden)}`}>
                    {getActivationLabel(selectedUserForDetails.activated, selectedUserForDetails.Forbidden)}
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
