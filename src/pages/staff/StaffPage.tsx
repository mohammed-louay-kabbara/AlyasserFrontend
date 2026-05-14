import React, { useState, useEffect } from "react";
import { getAdminStaff, createStaff, updateStaff, deleteStaff } from "../../api/staff.api";
import { getRoles } from "../../api/roles.api";
import toast from "react-hot-toast";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import DataTableWrapper from "../../components/ui/DataTableWrapper";
import ConfirmModal from "../../components/ui/ConfirmModal";
import { getActivationBadge, getActivationLabel, getRoleLabel } from "../../utils/dataTableUtils";
import type { Role as ApiRole } from "../../api/roles.api";

const StaffPage: React.FC = () => {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
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
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<(() => void | Promise<void>) | null>(null);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalStaff, setTotalStaff] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

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

  const handleSaveStaff = async () => {
    if (!formData.name || !formData.phone ) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
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
      setShowStaffModal(false);
      fetchStaff();
    } catch (error: any) {
      console.error("Error saving staff:", error);
      toast.error(error.response?.data?.message || "فشل في حفظ الموظف");
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
        </div>
        <div className="flex gap-2">
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
              render: (value: any) => getRoleLabel(value)
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

      {/* Add/Edit Staff Modal */}
      {showStaffModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold mb-4">
              {editingStaff ? "تعديل الموظف" : "إضافة موظف جديد"}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الاسم</label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(value) => setFormData({ ...formData, name: value })}
                  placeholder="الاسم الكامل"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الهاتف</label>
                <Input
                  type="text"
                  value={formData.phone}
                  onChange={(value) => setFormData({ ...formData, phone: value })}
                  placeholder="رقم الهاتف"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">العنوان</label>
                <Input
                  type="text"
                  value={formData.address}
                  onChange={(value) => setFormData({ ...formData, address: value })}
                  placeholder="العنوان"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">المنطقة</label>
                <Input
                  type="text"
                  value={formData.zone}
                  onChange={(value) => setFormData({ ...formData, zone: value })}
                  placeholder="المنطقة"
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
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setShowStaffModal(false)}>
                إلغاء
              </Button>
              <Button onClick={handleSaveStaff} className="bg-primary text-white">
                حفظ
              </Button>
            </div>
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
