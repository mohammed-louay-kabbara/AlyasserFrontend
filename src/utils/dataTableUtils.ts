// Utility functions for DataTable components

export const getImageUrl = (imagePath: string | null) => {
  if (!imagePath) return null;
  // If path starts with 'uploads/', use it directly (public folder)
  if (imagePath.startsWith('uploads/')) {
    return `/${imagePath}`;
  }
  // Otherwise use storage path
  return `/storage/${imagePath}`;
};

export const formatCurrency = (amount: number) => {
  return `${amount} $`;
};

export const getStockBadge = (quantity: number) => {
  if (quantity === 0) return "bg-red-100 text-red-800";
  if (quantity < 5) return "bg-yellow-100 text-yellow-800";
  if (quantity < 20) return "bg-orange-100 text-orange-800";
  return "bg-green-100 text-green-800";
};

export const getStockLabel = (quantity: number) => {
  if (quantity === 0) return "منتهي المخزون";
  if (quantity < 5) return "مخزون منخفض";
  if (quantity < 20) return "مخزون كافٍ";
  return "مخزون وفير";
};

// User-specific utility functions
export const getActivationBadge = (activated: number, status?: string) => {
  if (status === "pending") {
    return "bg-yellow-100 text-yellow-800";
  }
  return activated === 1 
    ? "bg-green-100 text-green-800" 
    : "bg-gray-100 text-gray-800";
};

export const getActivationLabel = (activated: number, status?: string) => {
  if (status === "pending") {
    return "في الانتظار";
  }
  return activated == 1 ? "نشط" : "غير نشط";
};

export const getRoleLabel = (role: any) => {
  if (typeof role === 'object' && role !== null) {
    return role.name_ar || role.name_en || "غير محدد";
  }
  // Fallback for legacy role numbers
  return role == 1 ? "أدمن" : role == 2 ? "مستخدم" : role == 3 ? "مستودع" : role == 4 ? "سائق" : role == 5 ? "عميل" : "غير محدد";
};

// Order-specific utility functions
export const getStatusBadge = (status: string) => {
  const statusMap: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-blue-100 text-blue-800",
    processing: "bg-purple-100 text-purple-800",
    shipped: "bg-indigo-100 text-indigo-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
    failed: "bg-red-100 text-red-800",
    error: "bg-red-100 text-red-800",
  };
  return statusMap[status] || "bg-gray-100 text-gray-800";
};

export const getStatusLabel = (status: string) => {
  const statusMap: Record<string, string> = {
    pending: "معلق",
    approved: "موافق عليه",
    processing: "قيد المعالجة",
    shipped: "تم الشحن",
    delivered: "تم التسليم",
    cancelled: "ملغي",
    failed: "فشل",
    error: "خطأ",
  };
  return statusMap[status] || status;
};

export const getErrorDetails = (order: any) => {
  if (order.status === 'error' || order.status === 'failed') {
    return order.error_message || order.failure_reason || order.notes || "حدث خطأ غير محدد";
  }
  return null;
};

export const formatOrderCurrency = (amount: number | string) => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return `${Math.round(num || 0).toLocaleString("en-US")} $`;
};
