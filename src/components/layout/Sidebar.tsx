import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { Permission } from "../../types";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
  const location = useLocation();
  const { user, hasPermission } = useAuthStore((state: any) => state);
  const [dateTime, setDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatArabicDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
      numberingSystem: "latn",
    };
    return date.toLocaleDateString("ar-SY", options);
  };

  const menuItems = [
    { path: "/", label: "لوحة التحكم", icon: "LayoutDashboard", permission: "view_dashboard" as Permission },
    // { path: "/analytics", label: "التحليلات والتقارير", icon: "Analytics", permission: "view_analytics" as Permission },
    { path: "/users", label: "المستخدمين", icon: "Users", permission: "view_users" as Permission },
    { path: "/staff", label: "الموظفين", icon: "Users", permission: "view_staff" as Permission },
    { path: "/categories", label: "الأصناف", icon: "Tag", permission: "view_categories" as Permission },
    { path: "/products", label: "المنتجات", icon: "Package", permission: "view_products" as Permission },
    { path: "/offers", label: "العروض", icon: "BadgePercent", permission: "view_offers" as Permission },
    { path: "/orders", label: "الطلبات", icon: "ShoppingCart", permission: "view_orders" as Permission },
    { path: "/notifications", label: "الإشعارات", icon: "Bell", permission: "view_notifications" as Permission },
    { path: "/roles", label: "إدارة الأدوار", icon: "Users", permission: "manage_user_roles" as Permission },
  ];

  const filteredMenuItems = menuItems.filter((item) => {
    if (!user || !user.permissions) {
      return false;
    }
    return hasPermission(item.permission);
  });

  const getIcon = (iconName: string) => {
    const icons: Record<string, string> = {
      LayoutDashboard: "M3 3h18v18H3V3zm16 16V5H5v14h14zM11 7h2v2h-2V7zm0 4h2v2h-2v-2zm0 4h2v2h-2v-2z",
      Users: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm7 4a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",
      Tag: "M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z",
      Package: "M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z",
      BadgePercent: "M2.5 8.5A2.5 2.5 0 0 1 5 6h14a2.5 2.5 0 0 1 2.5 2.5v7a2.5 2.5 0 0 1-2.5 2.5H5a2.5 2.5 0 0 1-2.5-2.5v-7zM12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0-2 0m-3 0m-1 0a1 1 0 1 0 2 0a1 1 0 1 0-2 0m6 0m-1 0a1 1 0 1 0 2 0a1 1 0 1 0-2 0",
      ShoppingCart: "M9 2L6 9H3l3 9h12l3-9h-3l-3-7z",
      Bell: "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0",
      DollarSign: "M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",
      Analytics: "M3 13a9 9 0 0 0 9-9H3a9 9 0 0 0-9 9v13a9 9 0 0 0 9 9h13a9 9 0 0 0 9-9V13zM5 20h14v-2H5v2zm0-4h14v-2H5v2zm0-4h14v-2H5v2zm0-4h14V8H5v2z",
    };
    return icons[iconName] || "";
  };

  const drawerClasses = isOpen ? "translate-x-0" : "translate-x-full";

  return (
    <aside
      id="sidebar-drawer"
      className={`fixed inset-y-0 right-0 z-50 h-screen w-72 transform overflow-y-auto bg-gradient-to-b from-gray-900 to-gray-800 shadow-2xl transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:inset-auto md:block ${drawerClasses}`}
    >
      <div className="flex items-center justify-between p-4 md:justify-center">
        <div>
          <div className="bg-gradient-to-br from-red-600 to-red-400 rounded-xl p-4 shadow-lg text-center">
            <p className="text-white font-bold text-lg mb-1">مركز الياسر التجاري</p>
            <p className="text-white/90 text-xs">لوحة التحكم</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="ml-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white md:hidden"
          aria-label="إغلاق القائمة"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <nav className="flex-1 px-4">
        <ul className="space-y-2">
          {filteredMenuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                onClick={onClose}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  location.pathname === item.path
                    ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg"
                    : "text-gray-300 hover:bg-gray-700/50 hover:text-white"
                }`}
              >
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={getIcon(item.icon)} />
                </svg>
                <span className="font-medium">{item.label}</span>
                {location.pathname === item.path && (
                  <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-700">
        <div className="text-center text-gray-300">
          <p className="text-sm font-medium">{formatArabicDate(dateTime)}</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
