import React from "react";
import Button from "../ui/Button";

interface Order {
  id: number;
  user: { name: string; phone: string; address: string };
  status: string;
  total_amount: number;
  created_at: string;
  items: Array<{
    product: { name: string };
    quantity: number;
    price: number;
  }>;
}

interface PrintOrderModalProps {
  order: Order;
  onClose: () => void;
}

const PrintOrderModal: React.FC<PrintOrderModalProps> = ({ order, onClose }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "SYP",
    }).format(amount);
  };

  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: "قيد الانتظار",
      processing: "قيد المعالجة",
      ready: "جاهز",
      delivered: "تم التوصيل",
      cancelled: "ملغي",
    };
    return statusMap[status] || status;
  };

  const handlePrint = () => {
    const printContent = document.getElementById("print-content");
    if (printContent) {
      const printWindow = window.open("", "", "width=800,height=600");
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>طلب #${order.id}</title>
              <style>
                body { font-family: Arial, sans-serif; padding: 20px; direction: rtl; }
                .header { text-align: center; margin-bottom: 20px; }
                .order-info { margin-bottom: 20px; }
                .order-info p { margin: 5px 0; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: right; }
                th { background-color: #f2f2f2; }
                .total { font-weight: bold; font-size: 18px; }
              </style>
            </head>
            <body>
              ${printContent.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-[600px] shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4 text-center">
            طباعة الطلب #{order.id}
          </h3>

          <div id="print-content" className="mb-4">
            <div className="header">
              <h2>فاتورة طلب</h2>
              <p>رقم الطلب: #{order.id}</p>
              <p>التاريخ: {new Date(order.created_at).toLocaleDateString("en-US")}</p>
            </div>

            <div className="order-info">
              <p><strong>اسم العميل:</strong> {order.user?.name || "-"}</p>
              <p><strong>رقم الهاتف:</strong> {order.user?.phone || "-"}</p>
              <p><strong>العنوان:</strong> {order.user?.address || "-"}</p>
              <p><strong>الحالة:</strong> {getStatusLabel(order.status)}</p>
            </div>

            <table>
              <thead>
                <tr>
                  <th>المنتج</th>
                  <th>الكمية</th>
                  <th>السعر</th>
                  <th>المجموع</th>
                </tr>
              </thead>
              <tbody>
                {order.items?.map((item, index) => (
                  <tr key={index}>
                    <td>{item.product?.name || "-"}</td>
                    <td>{item.quantity}</td>
                    <td>{formatCurrency(item.price)}</td>
                    <td>{formatCurrency(item.quantity * item.price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="total text-right">
              <p>المجموع الكلي: {formatCurrency(order.total_amount)}</p>
            </div>
          </div>

          <div className="flex space-x-reverse space-x-3 pt-4">
            <Button onClick={handlePrint} className="flex-1">
              طباعة
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              إغلاق
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintOrderModal;
