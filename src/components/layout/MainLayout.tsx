import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import Breadcrumb from "./Breadcrumb";

const MainLayout: React.FC = () => {
  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden" dir="rtl">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4" style={{ direction: 'ltr' }}>
          <div dir="rtl">
            <Breadcrumb />
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
