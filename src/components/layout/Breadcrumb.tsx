import React from "react";
import { useLocation, Link } from "react-router-dom";

const routeLabels: Record<string, string> = {
  "": "لوحة التحكم",
  analytics: "التحليلات والتقارير",
  users: "المستخدمين",
  categories: "الأصناف",
  products: "المنتجات",
  offers: "العروض",
  orders: "الطلبات",
  warehouses: "المستودعات",
  staff: "الموظفين",
  notifications: "الإشعارات",
  "exchange-rates": "إدارة أسعار الصرف",
  roles: "إدارة الأدوار",
  profile: "الملف الشخصي",
};

const Breadcrumb: React.FC = () => {
  const location = useLocation();
  const pathSegments = location.pathname.split("/").filter(Boolean);

  if (pathSegments.length === 0) return null;

  const breadcrumbs: { label: string; path: string }[] = [
    { label: "لوحة التحكم", path: "/" },
  ];

  let currentPath = "";
  for (let i = 0; i < pathSegments.length; i++) {
    const segment = pathSegments[i];
    currentPath += `/${segment}`;

    // Check if this is a dynamic segment (like :id or :categoryId)
    const isDynamic = /^\d+$/.test(segment);

    if (isDynamic) {
      // Try to get a meaningful label from the previous segment context
      const prevSegment = pathSegments[i - 1];
      if (prevSegment === "categories" && pathSegments[i + 1] === "products") {
        // Skip the ID, the next segment "products" will handle it
        continue;
      }
      // For other dynamic segments, just show a generic label
      breadcrumbs.push({ label: `#${segment}`, path: currentPath });
    } else {
      const label = routeLabels[segment] || segment;
      // Special case: categories/:id/products
      if (segment === "products" && pathSegments[i - 2] === "categories") {
        breadcrumbs.push({ label: "منتجات الصنف", path: currentPath });
      } else {
        breadcrumbs.push({ label, path: currentPath });
      }
    }
  }

  return (
    <nav className="flex items-center gap-1 mb-6">
      {breadcrumbs.map((crumb, index) => {
        const isLast = index === breadcrumbs.length - 1;
        return (
          <React.Fragment key={crumb.path}>
            {index > 0 && (
              <div className="flex items-center mx-1">
                <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-br from-red-400 to-red-600"></div>
              </div>
            )}
            {isLast ? (
              <span className="text-lg font-bold text-gray-900 bg-gradient-to-l from-red-600 to-red-400 bg-clip-text text-transparent">
                {crumb.label}
              </span>
            ) : (
              <Link
                to={crumb.path}
                className="text-base text-gray-500 hover:text-red-600 transition-colors duration-200 hover:font-medium"
              >
                {crumb.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default Breadcrumb;
