import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAdminWarehouses, createWarehouse, updateWarehouse, deleteWarehouse } from "../../api/warehouse.api";
import toast from "react-hot-toast";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import DataTableWrapper from "../../components/ui/DataTableWrapper";
import ConfirmModal from "../../components/ui/ConfirmModal";
import { getActivationBadge, getActivationLabel } from "../../utils/dataTableUtils";

const WarehousePage: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<any>(null);
  const [formData, setFormData] = useState({ name: "", address: "", phone: "", zone: "", password: "" });
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);
  const [confirmMessage, setConfirmMessage] = useState("");

  useEffect(() => {
    fetchWarehouses();
  }, [search]);

  const fetchWarehouses = async () => {
    try {
      setLoading(true);
      const response = await getAdminWarehouses({ search: search || undefined });
      setWarehouses(response.data || []);
    } catch (error) {
      console.error("Error fetching warehouses:", error);
      toast.error("فشل في جلب المستودعات");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("يرجى إدخال اسم المستودع");
      return;
    }

    const formDataObj = new FormData();
    formDataObj.append("name", formData.name);
    if (formData.address) formDataObj.append("address", formData.address);
    if (formData.phone) formDataObj.append("phone", formData.phone);
    if (formData.zone) formDataObj.append("zone", formData.zone);
    if (formData.password) formDataObj.append("password", formData.password);

    try {
      if (editingWarehouse) {
        await updateWarehouse(editingWarehouse.id, formDataObj);
        toast.success("تم تحديث المستودع بنجاح");
      } else {
        await createWarehouse(formDataObj);
        toast.success("تم إضافة المستودع بنجاح");
      }
      setShowAddModal(false);
      setEditingWarehouse(null);
      setFormData({ name: "", address: "", phone: "", zone: "", password: "" });
      fetchWarehouses();
    } catch (error) {
      console.error("Error saving warehouse:", error);
      toast.error(editingWarehouse ? "فشل في تحديث المستودع" : "فشل في إضافة المستودع");
    }
  };

  const handleEdit = (warehouse: any) => {
    setEditingWarehouse(warehouse);
    setFormData({
      name: warehouse.name,
      address: warehouse.address || "",
      phone: warehouse.phone || "",
      zone: warehouse.zone || "",
      password: ""
    });
    setShowAddModal(true);
  };

  const handleDelete = async (warehouseId: number) => {
    setConfirmMessage("هل أنت متأكد من حذف هذا المستودع؟");
    setConfirmAction(async () => {
      try {
        await deleteWarehouse(warehouseId);
        toast.success("تم حذف المستودع بنجاح");
        fetchWarehouses();
      } catch (error) {
        console.error("Error deleting warehouse:", error);
        toast.error("فشل في حذف المستودع");
      }
    });
    setShowConfirmModal(true);
  };

  
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <Input
          placeholder="البحث بالاسم"
          value={search}
          onChange={setSearch}
          className="w-64"
        />
        <div className="flex gap-2">
          <Button
            onClick={fetchWarehouses}
            variant="outline"
            className="flex items-center gap-2"
          >
            <span>🔄</span>
            تحديث
          </Button>
          <Button onClick={() => setShowAddModal(true)} className="bg-primary text-white">
            إضافة مستودع
          </Button>
        </div>
      </div>

      <DataTableWrapper
        data={warehouses}
        loading={loading}
        columns={[
          {
            key: "name",
            label: "الاسم",
            sortable: true
          },
          {
            key: "address",
            label: "العنوان",
            sortable: true,
            render: (value: any) => value || "-"
          },
          {
            key: "phone",
            label: "الهاتف",
            sortable: true,
            render: (value: any) => value || "-"
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
            render: (_: any, row: any) => {
              // Check multiple possible status fields
              const status = row.activated ?? row.status ?? row.is_active ?? 1;
              return (
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getActivationBadge(status)}`}>
                  {getActivationLabel(status)}
                </span>
              );
            }
          },
          {
            key: "view_orders",
            label: "عرض الطلبات",
            sortable: false,
            render: (_: any, row: any) => (
              <button
                onClick={() => {
                  navigate(`/warehouses/${row.id}/orders`);
                }}
                className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
              >
                عرض الطلبات
              </button>
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
                  onClick={() => {
                    handleEdit(row);
                  }}
                >
                  تعديل
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => {
                    handleDelete(row.id);
                  }}
                >
                  حذف
                </Button>
              </div>
            )
          },
        ]}
        serverSide={false}
        searchable={false}
        emptyMessage="لا توجد مستودعات"
      />

      {/* Add/Edit Warehouse Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingWarehouse ? "تعديل المستودع" : "إضافة مستودع جديد"}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="اسم المستودع"
                  placeholder="أدخل اسم المستودع"
                  value={formData.name}
                  onChange={(value) => setFormData({ ...formData, name: value })}
                  required
                />

                <Input
                  label="العنوان"
                  placeholder="أدخل عنوان المستودع"
                  value={formData.address}
                  onChange={(value) => setFormData({ ...formData, address: value })}
                />

                <Input
                  label="رقم الهاتف"
                  placeholder="أدخل رقم الهاتف"
                  value={formData.phone}
                  onChange={(value) => setFormData({ ...formData, phone: value })}
                />

                <Input
                  label="المنطقة"
                  placeholder="أدخل المنطقة"
                  value={formData.zone}
                  onChange={(value) => setFormData({ ...formData, zone: value })}
                />

                <Input
                  label="كلمة المرور"
                  type="password"
                  placeholder={editingWarehouse ? "أدخل كلمة المرور الجديدة (اختياري)" : "أدخل كلمة المرور"}
                  value={formData.password}
                  onChange={(value) => setFormData({ ...formData, password: value })}
                  required={!editingWarehouse}
                />

                <div className="flex space-x-reverse space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90"
                  >
                    {editingWarehouse ? "تحديث" : "إضافة"}
                  </button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowAddModal(false);
                      setEditingWarehouse(null);
                      setFormData({ name: "", address: "", phone: "", zone: "", password: "" });
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

export default WarehousePage;
