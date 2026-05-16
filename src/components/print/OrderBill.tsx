import React from "react";

interface OrderBillProps {
  order: any;
  user: any;
}

const OrderBill: React.FC<OrderBillProps> = ({ order, user }) => {
  const formatCurrency = (amount: number | string) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `${(num || 0).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })} $`;
  };

  const totalAmount = order.total_syp || order.total_amount || 0;

  return (
    <div className="print-bill" style={{ 
      width: '100%',
      maxWidth: '800px',
      margin: '0 auto',
      padding: '20px',
      fontFamily: 'Tajawal, Cairo, sans-serif',
      direction: 'rtl'
    }}>
      {/* Header */}
      <div style={{ 
        textAlign: 'center', 
        marginBottom: '30px',
        borderBottom: '3px solid #000',
        paddingBottom: '20px'
      }}>
        <h1 style={{ 
          fontSize: '28px', 
          fontWeight: 'bold', 
          margin: '0',
          color: '#000'
        }}>
          مركز الياسر التجاري
        </h1>
        <p style={{ 
          fontSize: '14px', 
          margin: '5px 0 0',
          color: '#666'
        }}>
          فاتورة
        </p>
      </div>

      {/* Order Info */}
      <div style={{
        marginBottom: '30px',
        display: 'flex',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <p style={{ fontSize: '14px', margin: '5px 0' }}>
            <strong>رقم الطلب:</strong> #{order.id}
          </p>
          <p style={{ fontSize: '14px', margin: '5px 0' }}>
            <strong>التاريخ:</strong> {new Date(order.created_at).toLocaleDateString("en-US")}
          </p>
        </div>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <p style={{ fontSize: '14px', margin: '5px 0' }}>
            <strong>اسم العميل:</strong> {user?.name || order.user?.name || "-"}
          </p>
          <p style={{ fontSize: '14px', margin: '5px 0' }}>
            <strong>رقم الهاتف:</strong> {user?.phone || order.user?.phone || "-"}
          </p>
          <p style={{ fontSize: '14px', margin: '5px 0' }}>
            <strong>العنوان:</strong> {user?.address || order.user?.address || "-"}
          </p>
        </div>
      </div>

      {/* Items Table */}
      <table style={{ 
        width: '100%',
        borderCollapse: 'collapse',
        marginBottom: '30px'
      }}>
        <thead>
          <tr style={{ 
            backgroundColor: '#f5f5f5',
            borderBottom: '2px solid #000'
          }}>
            <th style={{ 
              padding: '12px',
              textAlign: 'right',
              fontSize: '14px',
              fontWeight: 'bold',
              border: '1px solid #ddd'
            }}>
              #
            </th>
            <th style={{ 
              padding: '12px',
              textAlign: 'right',
              fontSize: '14px',
              fontWeight: 'bold',
              border: '1px solid #ddd'
            }}>
              المنتج
            </th>
            <th style={{ 
              padding: '12px',
              textAlign: 'center',
              fontSize: '14px',
              fontWeight: 'bold',
              border: '1px solid #ddd'
            }}>
              الكمية
            </th>
            <th style={{ 
              padding: '12px',
              textAlign: 'center',
              fontSize: '14px',
              fontWeight: 'bold',
              border: '1px solid #ddd'
            }}>
              السعر
            </th>
            <th style={{ 
              padding: '12px',
              textAlign: 'center',
              fontSize: '14px',
              fontWeight: 'bold',
              border: '1px solid #ddd'
            }}>
              الإجمالي
            </th>
          </tr>
        </thead>
        <tbody>
          {order.items?.map((item: any, index: number) => {
            const isOffer = item.purchase_type === 'عرض' || item.offer_id;
            const name = isOffer 
              ? item.offer?.description || 'عرض' 
              : item.product?.name || 'منتج';
            const price = item.unit_price || item.price || 0;
            const quantity = Number(item.quantity || 0);
            const displayQuantity = Number.isNaN(quantity)
              ? 0
              : quantity.toLocaleString('en-US', { useGrouping: false, maximumFractionDigits: 0 });
            const subtotal = item.sub_total || (quantity * price);

            return (
              <tr key={index} style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ 
                  padding: '12px',
                  textAlign: 'right',
                  fontSize: '14px',
                  border: '1px solid #ddd'
                }}>
                  {index + 1}
                </td>
                <td style={{ 
                  padding: '12px',
                  textAlign: 'right',
                  fontSize: '14px',
                  border: '1px solid #ddd'
                }}>
                  {name}
                  {isOffer && (
                    <span style={{ 
                      marginLeft: '8px',
                      fontSize: '12px',
                      backgroundColor: '#f3e8ff',
                      color: '#7c3aed',
                      padding: '2px 6px',
                      borderRadius: '4px'
                    }}>
                      عرض
                    </span>
                  )}
                </td>
                <td style={{ 
                  padding: '12px',
                  textAlign: 'center',
                  fontSize: '14px',
                  border: '1px solid #ddd'
                }}>
                  {displayQuantity}
                </td>
                <td style={{ 
                  padding: '12px',
                  textAlign: 'center',
                  fontSize: '14px',
                  border: '1px solid #ddd'
                }}>
                  {formatCurrency(price)}
                </td>
                <td style={{ 
                  padding: '12px',
                  textAlign: 'center',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  border: '1px solid #ddd'
                }}>
                  {formatCurrency(subtotal)}
                </td>
              </tr>
            );
          })}
          {(!order.items || order.items.length === 0) && (
            <tr>
              <td colSpan={5} style={{ 
                padding: '20px',
                textAlign: 'center',
                fontSize: '14px',
                border: '1px solid #ddd'
              }}>
                لا توجد عناصر
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Total Section */}
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        marginBottom: '30px'
      }}>
        <div style={{
          backgroundColor: '#f5f5f5',
          padding: '20px',
          borderRadius: '8px',
          width: '100%',
          maxWidth: '800px',
          border: '2px solid #000'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '10px',
            fontSize: '16px'
          }}>
            <strong>المبلغ الإجمالي:</strong>
            <strong style={{ fontSize: '20px', color: '#000' }}>
              {formatCurrency(totalAmount)}
            </strong>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ 
        textAlign: 'center',
        marginTop: '40px',
        paddingTop: '20px',
        borderTop: '1px solid #ddd',
        fontSize: '12px',
        color: '#666'
      }}>
        <p style={{ margin: '5px 0' }}>شكراً لتعاملكم مع مركز الياسر التجاري</p>
        <p style={{ margin: '5px 0' }}>
          {new Date().toLocaleDateString("en-US")} - {new Date().toLocaleTimeString("en-US")}
        </p>
      </div>
    </div>
  );
};

export default OrderBill;
