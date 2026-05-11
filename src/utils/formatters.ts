export const formatCurrency = (amount: number, currency: "USD" | "SYP" = "USD") => {
  if (currency === "USD") return `$${amount.toFixed(2)}`;
  return `${Math.round(amount).toLocaleString("en-US")} SYP`;
};

export const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric"
  });
};

export const formatDateTime = (dateStr: string) => {
  return new Date(dateStr).toLocaleString("en-US");
};

export const getOrderStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    pending: "Pending",
    approved: "Approved",
    processing: "Processing",
    delivered: "Delivered",
    rejected: "Rejected",
  };
  return labels[status] ?? status;
};

export const getRoleLabel = (role: string) => {
  const labels: Record<string, string> = {
    admin: "Admin",
    customer: "Customer",
    warehouse_manager: "Warehouse Manager",
    driver: "Driver",
  };
  return labels[role] ?? role;
};

export const getUserStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    pending: "Pending",
    active: "Active",
    inactive: "Inactive",
    rejected: "Rejected",
  };
  return labels[status] ?? status;
};
