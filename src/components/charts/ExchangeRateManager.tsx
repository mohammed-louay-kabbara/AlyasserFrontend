import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getExchangeRate, updateExchangeRate } from "../../api/orders.api";
import toast from "react-hot-toast";
import Button from "../ui/Button";
import Input from "../ui/Input";

const ExchangeRateManager: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [newRate, setNewRate] = useState("");
  const queryClient = useQueryClient();

  const { data: exchangeRate, isLoading } = useQuery({
    queryKey: ["exchangeRate"],
    queryFn: getExchangeRate,
    refetchInterval: 300000, // Refresh every 5 minutes
  });

  const updateRateMutation = useMutation({
    mutationFn: (rate: number) => updateExchangeRate(rate),
    onSuccess: () => {
      toast.success("تم تحديث سعر الصرف بنجاح");
      setIsEditing(false);
      setNewRate("");
      queryClient.invalidateQueries({ queryKey: ["exchangeRate"] });
    },
    onError: () => {
      toast.error("فشل تحديث سعر الصرف");
    },
  });

  const handleUpdateRate = () => {
    const rate = parseFloat(newRate);
    if (isNaN(rate) || rate <= 0) {
      toast.error("Please enter a valid exchange rate");
      return;
    }
    updateRateMutation.mutate(rate);
  };

  const getCurrentRate = () => {
    return exchangeRate?.data?.rate || 12500; // Default fallback rate
  };

  const getLastUpdated = () => {
    return exchangeRate?.data?.updated_at 
      ? new Date(exchangeRate.data.updated_at).toLocaleString('en-US')
      : "Not available";
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">إدارة سعر الصرف</h3>
        <div className="text-xs text-gray-500">
          آخر تحديث: {getLastUpdated()}
        </div>
      </div>

      {/* Current Rate Display */}
      <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-lg mb-6">
        <div className="text-center">
          <div className="text-sm text-green-600 mb-2">سعر الصرف الحالي</div>
          <div className="text-4xl font-bold text-green-900 mb-2">
            1 دولار = {Math.round(getCurrentRate()).toLocaleString('en-US')} ل.س
          </div>
          <div className="text-sm text-green-700">
            {isLoading ? "جاري التحميل..." : "سعر مباشر"}
          </div>
        </div>
      </div>

      {/* Rate Calculator */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">آلة حاسبة سريعة</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-600">دولار إلى ليرة</label>
            <div className="mt-1 p-2 bg-white rounded border border-gray-200">
              <span className="text-sm text-gray-900">
                100 دولار = {Math.round(100 * getCurrentRate()).toLocaleString('en-US')} ل.س
              </span>
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-600">ليرة إلى دولار</label>
            <div className="mt-1 p-2 bg-white rounded border border-gray-200">
              <span className="text-sm text-gray-900">
                100,000 ل.س = {Math.round(100000 / getCurrentRate()).toLocaleString('en-US')} دولار
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Update Rate Form */}
      {!isEditing ? (
        <div className="flex justify-center">
          <Button
            onClick={() => {
              setIsEditing(true);
              setNewRate(getCurrentRate().toString());
            }}
            className="bg-primary text-white"
          >
            تحديث سعر الصرف
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              سعر صرف جديد (ل.س لكل 1 دولار)
            </label>
            <Input
              type="text"
              value={newRate.replace(/\.0+$/, "")}
              onChange={setNewRate}
              placeholder="أدخل السعر الجديد"
              className="w-full"
            />
          </div>
          
          <div className="flex space-x-reverse space-x-3">
            <Button
              onClick={handleUpdateRate}
              disabled={updateRateMutation.isPending}
              className="bg-green-600 text-white"
            >
              {updateRateMutation.isPending ? "جاري التحديث..." : "تحديث السعر"}
            </Button>
            <Button
              onClick={() => {
                setIsEditing(false);
                setNewRate("");
              }}
              variant="outline"
            >
              إلغاء
            </Button>
          </div>
        </div>
      )}

      {/* Rate History Insight */}
      <div className="mt-6 p-3 bg-blue-50 rounded-lg">
        <div className="text-sm text-blue-800">
          <strong>مهم:</strong> 
          أسعار الصرف تؤثر على جميع حسابات التسعير في النظام. 
          قم بتحديث هذا السعر بانتظام لضمان تقارير مالية وتسعير دقيقة.
          يجب الحصول على سعر السوق الحالي من مصادر مالية رسمية.
        </div>
      </div>

      {/* Quick Reference */}
      <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
        <div className="text-sm text-yellow-800">
          <strong>مرجع سريع:</strong> 
          أسعار الليرة السورية النموذجية تتراوح من 12,000-15,000 ل.س لكل دولار. 
          تحقق من الأسعار الحالية قبل التحديث لضمان الدقة في الحسابات المالية.
        </div>
      </div>
    </div>
  );
};

export default ExchangeRateManager;
