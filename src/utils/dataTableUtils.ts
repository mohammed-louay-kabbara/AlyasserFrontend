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
  // if (quantity === 0) return "bg-red-100 text-red-800";
  if (quantity < 10) return "bg-red-100 text-red-800";
  // if (quantity < 20) return "bg-orange-100 text-orange-800";
  return "bg-green-100 text-green-800";
};

export const getStockLabel = (quantity: number) => {
  // if (quantity === 0) return "منتهي المخزون";
  if (quantity < 10) return "مخزون منخفض";
  return "مخزون وفير";
};

// User-specific utility functions
export const getActivationBadge = (activated: number, forbidden?: number) => {
  if (activated === 1) {
    return "bg-green-100 text-green-800";
  }
  if (activated === 0 && forbidden === 1) {
    return "bg-red-100 text-red-800";
  }
  return "bg-yellow-100 text-yellow-800";
};

export const getActivationLabel = (activated: number, forbidden?: number) => {
  if (activated == 1) {
    return "نشط";
  }
  if (activated == 0 && forbidden == 1) {
    return "مجمد";
  }
  return "معلق";
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
    confirmed: "bg-blue-100 text-blue-800",
    processing: "bg-purple-100 text-purple-800",
    delivered: "bg-green-100 text-green-800",
    completed: "bg-green-100 text-green-800",
    error: "bg-red-100 text-red-800",
  };
  return statusMap[status] || "bg-gray-100 text-gray-800";
};

export const getStatusLabel = (status: string) => {
  const statusMap: Record<string, string> = {
    pending: "معلق",
    confirmed: "موافق عليه",
    processing: "قيد المعالجة",
    delivered: "تم التسليم",
    completed: "تم التوصيل",
    error: "مشكلة",
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
