import React from "react";
import SalesChart from "../../components/charts/SalesChart";
import InventoryChart from "../../components/charts/InventoryChart";
import OrdersChart from "../../components/charts/OrdersChart";

const AnalyticsPage: React.FC = () => {
  return (
    <div>
      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <SalesChart />
        <InventoryChart />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <OrdersChart />
      </div>
    </div>
  );
};

export default AnalyticsPage;
