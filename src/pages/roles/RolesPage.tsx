import React, { useState, useEffect } from "react";
import { getRoles, createRole, updateRole, deleteRole, getPermissions } from "../../api/roles.api";
import type { Role as ApiRole, Permission as ApiPermission } from "../../api/roles.api";
import Button from "../../components/ui/Button";
import DataTableWrapper from "../../components/ui/DataTableWrapper";
import toast from "react-hot-toast";
import ConfirmModal from "../../components/ui/ConfirmModal";

const RolesPage: React.FC = () => {
  const [roles, setRoles] = useState<ApiRole[]>([]);
  const [permissions, setPermissions] = useState<ApiPermission[]>([]);
  const [loading, setLoading] = useState(false);

  // Helper function to group permissions by category
  const groupPermissionsByCategory = (permissions: ApiPermission[]) => {
    return permissions.reduce((acc, permission) => {
      if (!acc[permission.category]) {
        acc[permission.category] = [];
      }
      acc[permission.category].push(permission);
      return acc;
    }, {} as Record<string, ApiPermission[]>);
  };
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingRole, setEditingRole] = useState<ApiRole | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<Set<number>>(new Set());
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleNameAr, setNewRoleNameAr] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);
  const [confirmMessage, setConfirmMessage] = useState("");

  // Fetch roles from API
  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await getRoles();
      setRoles(response.data);
    } catch (error) {
      console.error("Error fetching roles:", error);
      toast.error("فشل في جلب الأدوار");
    } finally {
      setLoading(false);
    }
  };

  // Fetch permissions from API
  const fetchPermissions = async () => {
    try {
      const response = await getPermissions();
      setPermissions(response.data);
    } catch (error) {
      console.error("Error fetching permissions:", error);
      toast.error("فشل في جلب الصلاحيات");
    }
  };

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, []);

  const handleEdit = (role: ApiRole) => {
    setEditingRole(role);
    const permissionIds = new Set(role.permissions.map((p: ApiPermission) => p.id));
    setSelectedPermissions(permissionIds);
    setShowEditModal(true);
  };

  const handleDelete = async (role: ApiRole) => {
    setConfirmMessage(`هل أنت متأكد من حذف الدور "${role.name_ar}"؟`);
    setConfirmAction(async () => {
      try {
        await deleteRole(role.id);
        toast.success("تم حذف الدور بنجاح");
        fetchRoles();
      } catch (error) {
        console.error("Error deleting role:", error);
        toast.error("فشل في حذف الدور");
      }
    });
    setShowConfirmModal(true);
  };

  const handlePermissionToggle = (permissionId: number) => {
    setSelectedPermissions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(permissionId)) {
        newSet.delete(permissionId);
      } else {
        newSet.add(permissionId);
      }
      return newSet;
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRole) return;

    try {
      await updateRole(editingRole.id, {
        permissions: Array.from(selectedPermissions),
      });
      toast.success("تم تحديث صلاحيات الدور بنجاح");
      setShowEditModal(false);
      setEditingRole(null);
      setSelectedPermissions(new Set());
      fetchRoles();
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error("فشل في تحديث الدور");
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName || !newRoleNameAr) {
      toast.error("يرجى إدخال اسم الدور بالعربي والإنجليزي");
      return;
    }

    try {
      await createRole({
        name_en: newRoleName,
        name_ar: newRoleNameAr,
        permissions: Array.from(selectedPermissions),
      });
      toast.success("تم إنشاء الدور بنجاح");
      setShowCreateModal(false);
      setNewRoleName("");
      setNewRoleNameAr("");
      setSelectedPermissions(new Set());
      fetchRoles();
    } catch (error) {
      console.error("Error creating role:", error);
      toast.error("فشل في إنشاء الدور");
    }
  };

  const handleCloseModal = () => {
    setShowEditModal(false);
    setShowCreateModal(false);
    setEditingRole(null);
    setSelectedPermissions(new Set());
    setNewRoleName("");
    setNewRoleNameAr("");
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div></div>
        <div className="flex gap-2">
          <Button
            onClick={() => {
              setShowCreateModal(true);
              setSelectedPermissions(new Set());
            }}
            className="bg-primary text-white"
          >
            إضافة دور جديد
          </Button>
          <Button
            onClick={fetchRoles}
            variant="outline"
            className="flex items-center gap-2"
          >
            <span>🔄</span>
            تحديث
          </Button>
        </div>
      </div>

      <DataTableWrapper
        data={roles}
        loading={loading}
        columns={[
          {
            key: "name_ar",
            label: "اسم الدور",
            sortable: true,
          },
          {
            key: "name",
            label: "الاسم الإنجليزي",
            sortable: true,
          },
          {
            key: "permissions_count",
            label: "عدد الصلاحيات",
            sortable: true,
            render: (_value: any, row: any) => row.permissions.length,
          },
          {
            key: "actions",
            label: "الإجراءات",
            sortable: false,
            render: (_value: any, row: any) => (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(row)}
                >
                  تعديل الصلاحيات
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-red-50 text-red-600 border-red-300 hover:bg-red-100"
                  onClick={() => handleDelete(row)}
                >
                  حذف
                </Button>
              </div>
            ),
          },
        ]}
        serverSide={false}
        searchable={false}
        emptyMessage="لا توجد أدوار"
      />

      {/* Edit Permissions Modal */}
      {showEditModal && editingRole && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              تعديل صلاحيات: {editingRole.name_ar}
            </h2>

            <form onSubmit={handleSave}>
              <div className="space-y-6">
                {Object.entries(groupPermissionsByCategory(permissions)).map(([categoryKey, categoryPermissions]) => (
                  <div key={categoryKey}>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      {categoryKey.charAt(0).toUpperCase() + categoryKey.slice(1)}
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {categoryPermissions.map((permission: ApiPermission) => (
                        <label
                          key={permission.id}
                          className="flex items-center space-x-2 space-x-reverse cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedPermissions.has(permission.id)}
                            onChange={() => handlePermissionToggle(permission.id)}
                            className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                          />
                          <span className="text-sm text-gray-700">
                            {permission.label_ar}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseModal}
                >
                  إلغاء
                </Button>
                <Button
                  type="submit"
                  className="bg-primary text-white"
                >
                  حفظ التغييرات
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Role Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              إضافة دور جديد
            </h2>

            <form onSubmit={handleCreate}>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    اسم الدور (إنجليزي)
                  </label>
                  <input
                    type="text"
                    value={newRoleName}
                    onChange={(e) => setNewRoleName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="e.g., sales_manager"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    اسم الدور (عربي)
                  </label>
                  <input
                    type="text"
                    value={newRoleNameAr}
                    onChange={(e) => setNewRoleNameAr(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="مثال: مدير المبيعات"
                  />
                </div>
              </div>

              <div className="space-y-6">
                {Object.entries(groupPermissionsByCategory(permissions)).map(([categoryKey, categoryPermissions]) => (
                  <div key={categoryKey}>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      {categoryKey.charAt(0).toUpperCase() + categoryKey.slice(1)}
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {categoryPermissions.map((permission: ApiPermission) => (
                        <label
                          key={permission.id}
                          className="flex items-center space-x-2 space-x-reverse cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedPermissions.has(permission.id)}
                            onChange={() => handlePermissionToggle(permission.id)}
                            className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                          />
                          <span className="text-sm text-gray-700">
                            {permission.label_ar}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseModal}
                >
                  إلغاء
                </Button>
                <Button
                  type="submit"
                  className="bg-primary text-white"
                >
                  إنشاء الدور
                </Button>
              </div>
            </form>
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

export default RolesPage;
