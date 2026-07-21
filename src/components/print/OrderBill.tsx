import React, { useEffect, useRef } from "react";

interface OrderBillProps {
  order: any;
  user: any;
}

const OrderBill: React.FC<OrderBillProps> = ({ order, user }) => {
  const billRef = useRef<HTMLDivElement>(null);

  const formatCurrency = (amount: number | string) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `${(num || 0).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })} $`;
  };

  const totalAmount = order.total_syp || order.total_amount || 0;

  useEffect(() => {
    const handleBeforePrint = () => {
      if (billRef.current) {
        const contentWidth = billRef.current.offsetWidth;
        const pageWidth = window.innerWidth;
        if (contentWidth > pageWidth) {
          const scale = pageWidth / contentWidth;
          billRef.current.style.transform = `scale(${scale * 0.95})`;
          billRef.current.style.transformOrigin = 'top center';
        }
      }
    };

    window.addEventListener('beforeprint', handleBeforePrint);
    return () => window.removeEventListener('beforeprint', handleBeforePrint);
  }, []);

  return (
    <>
      <style>{`
        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            height: 100% !important;
          }
          .print-wrapper {
            width: 100% !important;
            height: 100% !important;
            display: flex !important;
            justify-content: center !important;
            align-items: flex-start !important;
          }
          .print-content {
            transform: scale(0.75) !important;
            transform-origin: top center !important;
            width: 133.33% !important;
          }
          .print-bill {
            width: 100% !important;
            max-width: 100% !important;
            padding: 2mm !important;
            font-size: 6pt !important;
          }
          .print-bill table {
            font-size: 5pt !important;
            width: 100% !important;
            table-layout: fixed !important;
            page-break-inside: auto !important;
          }
          .print-bill thead {
            display: table-header-group !important;
          }
          .print-bill tbody {
            display: table-row-group !important;
          }
          .print-bill tr {
            page-break-inside: avoid !important;
            page-break-after: auto !important;
          }
          .print-bill th,
          .print-bill td {
            padding: 1mm 0.5mm !important;
            font-size: 5pt !important;
            word-wrap: break-word !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
            white-space: nowrap !important;
          }
          .print-bill h1 {
            font-size: 9pt !important;
            margin: 1mm 0 !important;
          }
          .print-bill p {
            font-size: 6pt !important;
            margin: 0.5mm 0 !important;
          }
          @page {
            margin: 2mm;
            size: auto;
            orientation: portrait;
          }
        }
        @media screen and (max-width: 768px) {
          .print-bill {
            padding: 10px;
            font-size: 11px;
          }
          .print-bill table {
            font-size: 9px;
          }
          .print-bill th,
          .print-bill td {
            padding: 4px 2px;
            font-size: 9px;
          }
        }
      `}</style>
      <div className="print-wrapper">
        <div className="print-content">
          <div ref={billRef} className="print-bill" style={{
            width: '100%',
            maxWidth: '100%',
            margin: '0 auto',
            padding: '15px',
            fontFamily: 'Tajawal, Cairo, sans-serif',
            direction: 'rtl',
            fontSize: '12px'
          }}>
      {/* Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: '20px',
        borderBottom: '2px solid #000',
        paddingBottom: '15px'
      }}>
        <h1 style={{
          fontSize: '20px',
          fontWeight: 'bold',
          margin: '0',
          color: '#000'
        }}>
          مركز الياسر التجاري
        </h1>
        <p style={{
          fontSize: '12px',
          margin: '5px 0 0',
          color: '#666'
        }}>
          فاتورة
        </p>
      </div>

      {/* Order Info */}
      <div style={{
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '15px'
      }}>
        <div style={{ flex: 1, minWidth: '150px' }}>
          <p style={{ fontSize: '11px', margin: '3px 0' }}>
            <strong>رقم الطلب:</strong> {order.order_number}
          </p>
          <p style={{ fontSize: '11px', margin: '3px 0' }}>
            <strong>التاريخ:</strong> {new Date(order.created_at).toLocaleDateString("en-US")}
          </p>
        </div>
        <div style={{ flex: 1, minWidth: '150px' }}>
          <p style={{ fontSize: '11px', margin: '3px 0' }}>
            <strong>اسم العميل:</strong> {user?.name || order.user?.name || "-"}
          </p>
          <p style={{ fontSize: '11px', margin: '3px 0' }}>
            <strong>رقم الهاتف:</strong> {user?.phone || order.user?.phone || "-"}
          </p>
          <p style={{ fontSize: '11px', margin: '3px 0' }}>
            <strong>العنوان:</strong> {user?.address || order.user?.address || "-"}
          </p>
        </div>
      </div>

      {/* Items Table */}
      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
        marginBottom: '20px',
        fontSize: '10px'
      }}>
        <thead>
          <tr style={{
            backgroundColor: '#f5f5f5',
            borderBottom: '2px solid #000'
          }}>
            <th style={{
              padding: '6px 4px',
              textAlign: 'right',
              fontSize: '10px',
              fontWeight: 'bold',
              border: '1px solid #ddd',
              width: '5%'
            }}>
              #
            </th>
            <th style={{
              padding: '6px 4px',
              textAlign: 'right',
              fontSize: '10px',
              fontWeight: 'bold',
              border: '1px solid #ddd',
              width: '35%'
            }}>
              المنتج
            </th>
            <th style={{
              padding: '6px 4px',
              textAlign: 'right',
              fontSize: '10px',
              fontWeight: 'bold',
              border: '1px solid #ddd',
              width: '15%'
            }}>
              الوحدة
            </th>
            <th style={{
              padding: '6px 4px',
              textAlign: 'center',
              fontSize: '10px',
              fontWeight: 'bold',
              border: '1px solid #ddd',
              width: '10%'
            }}>
              الكمية
            </th>
            <th style={{
              padding: '6px 4px',
              textAlign: 'center',
              fontSize: '10px',
              fontWeight: 'bold',
              border: '1px solid #ddd',
              width: '15%'
            }}>
              السعر
            </th>
            <th style={{
              padding: '6px 4px',
              textAlign: 'center',
              fontSize: '10px',
              fontWeight: 'bold',
              border: '1px solid #ddd',
              width: '20%'
            }}>
              الإجمالي
            </th>
          </tr>
        </thead>
        <tbody>
          {order.items?.map((item: any, index: number) => {
            const isOffer = item.purchase_type === 'عرض' || item.offer_id;
            const offerProducts = isOffer && item.offer?.products ? item.offer.products : [];

            // If it's an offer, render each product in the offer
            if (isOffer && offerProducts.length > 0) {
              return offerProducts.map((offerProduct: any, productIndex: number) => {
                const isProvided = offerProduct.pivot?.provided === 1 || offerProduct.pivot?.provided === "1" || offerProduct.pivot?.provided === true;
                const purchaseType = offerProduct.pivot?.purchase_type || 'طرد';
                const productQuantity = Number(offerProduct.pivot?.quantity || 1);
                // Get price based on purchase_type
                let productPrice = 0;
                if (!isProvided) {
                  if (purchaseType === 'طرد') {
                    productPrice = offerProduct.wholesale_price || offerProduct.pivot?.price || 0;
                  } else if (purchaseType === 'قطعة') {
                    productPrice = offerProduct.retail_price || offerProduct.pivot?.price || 0;
                  } else {
                    productPrice = offerProduct.pivot?.price || offerProduct.retail_price || 0;
                  }
                }
                const subtotal = productQuantity * productPrice;

                return (
                  <tr key={`${index}-${productIndex}`} style={{ borderBottom: '1px solid #ddd' }}>
                    <td style={{
                      padding: '6px 4px',
                      textAlign: 'right',
                      fontSize: '10px',
                      border: '1px solid #ddd'
                    }}>
                      {index + 1}
                    </td>
                    <td style={{
                      padding: '6px 4px',
                      textAlign: 'right',
                      fontSize: '10px',
                      border: '1px solid #ddd'
                    }}>
                      {offerProduct.name || 'منتج'}
                      {isProvided && (
                        <span style={{
                          marginLeft: '4px',
                          fontSize: '9px',
                          backgroundColor: '#fef3c7',
                          color: '#d97706',
                          padding: '1px 4px',
                          borderRadius: '3px'
                        }}>
                          هدية
                        </span>
                      )}
                      {productIndex === 0 && (
                        <span style={{
                          marginLeft: '4px',
                          fontSize: '9px',
                          backgroundColor: '#f3e8ff',
                          color: '#7c3aed',
                          padding: '1px 4px',
                          borderRadius: '3px'
                        }}>
                          عرض
                        </span>
                      )}
                    </td>
                    <td style={{
                      padding: '6px 4px',
                      textAlign: 'center',
                      fontSize: '10px',
                      border: '1px solid #ddd'
                    }}>
                      {purchaseType}
                    </td>
                    <td style={{
                      padding: '6px 4px',
                      textAlign: 'center',
                      fontSize: '10px',
                      border: '1px solid #ddd'
                    }}>
                      {productQuantity.toLocaleString('en-US', { useGrouping: false, maximumFractionDigits: 0 })}
                    </td>
                    <td style={{
                      padding: '6px 4px',
                      textAlign: 'center',
                      fontSize: '10px',
                      border: '1px solid #ddd'
                    }}>
                      {formatCurrency(productPrice)}
                    </td>
                    <td style={{
                      padding: '6px 4px',
                      textAlign: 'center',
                      fontSize: '10px',
                      fontWeight: 'bold',
                      border: '1px solid #ddd'
                    }}>
                      {formatCurrency(subtotal)}
                    </td>
                  </tr>
                );
              });
            }

            // Regular product rendering
            const name = item.product?.name || 'منتج';
            const purchase_type = item.purchase_type || '-';
            const quantity = Number(item.quantity || 0);
            const displayQuantity = Number.isNaN(quantity)
              ? 0
              : quantity.toLocaleString('en-US', { useGrouping: false, maximumFractionDigits: 0 });
            // Get price based on purchase_type
            let price = 0;
            if (purchase_type === 'طرد') {
              price = item.product?.wholesale_price || item.unit_price || item.price || 0;
            } else if (purchase_type === 'قطعة') {
              price = item.product?.retail_price || item.unit_price || item.price || 0;
            } else {
              price = item.unit_price || item.price || 0;
            }
            const subtotal = item.sub_total || (quantity * price);

            return (
              <tr key={index} style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{
                  padding: '6px 4px',
                  textAlign: 'right',
                  fontSize: '10px',
                  border: '1px solid #ddd'
                }}>
                  {index + 1}
                </td>
                <td style={{
                  padding: '6px 4px',
                  textAlign: 'right',
                  fontSize: '10px',
                  border: '1px solid #ddd'
                }}>
                  {name}
                </td>
                <td style={{
                  padding: '6px 4px',
                  textAlign: 'center',
                  fontSize: '10px',
                  border: '1px solid #ddd'
                }}>
                  {purchase_type}
                </td>
                <td style={{
                  padding: '6px 4px',
                  textAlign: 'center',
                  fontSize: '10px',
                  border: '1px solid #ddd'
                }}>
                  {displayQuantity}
                </td>
                <td style={{
                  padding: '6px 4px',
                  textAlign: 'center',
                  fontSize: '10px',
                  border: '1px solid #ddd'
                }}>
                  {formatCurrency(price)}
                </td>
                <td style={{
                  padding: '6px 4px',
                  textAlign: 'center',
                  fontSize: '10px',
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
              <td colSpan={6} style={{
                padding: '10px',
                textAlign: 'center',
                fontSize: '10px',
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
        marginBottom: '15px'
      }}>
        <div style={{
          backgroundColor: '#f5f5f5',
          padding: '10px 15px',
          borderRadius: '4px',
          width: '100%',
          maxWidth: '100%',
          border: '2px solid #000'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '5px',
            fontSize: '12px'
          }}>
            <strong>المبلغ الإجمالي:</strong>
            <strong style={{ fontSize: '14px', color: '#000' }}>
              {formatCurrency(totalAmount)}
            </strong>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        textAlign: 'center',
        marginTop: '20px',
        paddingTop: '15px',
        borderTop: '1px solid #ddd',
        fontSize: '10px',
        color: '#666'
      }}>
        <p style={{ margin: '3px 0' }}>شكراً لتعاملكم مع مركز الياسر التجاري</p>
        <p style={{ margin: '3px 0' }}>
          {new Date().toLocaleDateString("en-US")} - {new Date().toLocaleTimeString("en-US")}
        </p>
      </div>
      </div>
      </div>
      </div>
    </>
  );
};

export default OrderBill;
