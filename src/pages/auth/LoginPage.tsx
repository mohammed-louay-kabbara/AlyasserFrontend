import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { login } from "../../api/auth.api";
import { useAuthStore } from "../../store/authStore";

const LoginPage: React.FC = () => {
  const logoUrl = new URL("../../public/logoName.png", import.meta.url).href;
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
 // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [phoneError, setPhoneError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const navigate = useNavigate();
  const setAuth = useAuthStore((state: any) => state.setAuth);

  const loginMutation = useMutation({
    mutationFn: () => login(phone, password),
    onSuccess: (response: any) => {
      const { user, access_token } = response.data;
      
      // منع المستخدمين ذوي role_id = 2 من الدخول (مثلاً العملاء العاديين)
      if (user.role_id === 2 || user.role?.id === 2) {
        toast.error("غير مسموح لك بالدخول إلى لوحة التحكم");
        return;
      }

      setAuth(user, access_token);
      toast.success("تم تسجيل الدخول بنجاح!");
      navigate("/");
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error ||
                          error.response?.data?.message ||
                          "فشل تسجيل الدخول";
      
      // Set specific field errors based on the error message
      if (errorMessage.includes("رقم الهاتف غير مسجل")) {
        setPhoneError(errorMessage);
        setPasswordError("");
      } else if (errorMessage.includes("كلمة المرور غير صحيحة")) {
        setPasswordError(errorMessage);
        setPhoneError("");
      } else {
        setPhoneError(errorMessage);
        setPasswordError("");
      }
    },
  });

  const handleSubmit = () => {
    setPhoneError("");
    setPasswordError("");
    if (!phone || !password) {
      toast.error("يرجى ملء جميع الحقول", { duration: 6000 });
      return;
    }
    loginMutation.mutate();
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(e.target.value);
    setPhoneError("");
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setPasswordError("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
          {/* Left Section - Logo & Info */}
          <div className="md:w-1/2 bg-gradient-to-br from-red-900 to-red-700 p-8 md:p-12 flex flex-col justify-center items-center text-white">
            <div className="mb-8">
              <img
                src={logoUrl}
                alt="AL YASER Logo"
                className="w-32 h-32 object-cover mx-auto rounded-full border-4 border-white/20 shadow-lg"
              />
            </div>
            <h2 className="text-3xl font-bold mb-4 text-center">مركز الياسر</h2>
            <p className="text-red-100 text-center text-lg">
              نظام إدارة متكامل
            </p>
            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-sm">إدارة سهلة وسريعة</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <span className="text-sm">أمان وحماية عالية</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="text-sm">أداء عالي وسرعة</span>
              </div>
            </div>
          </div>

          {/* Right Section - Login Form */}
          <div className="md:w-1/2 p-8 md:p-12">
            <div className="max-w-md mx-auto">
              <br />
              <h1 className="text-3xl font-bold text-gray-900 mb-2">مرحباً بك</h1>
              <p className="text-gray-600 mb-8">سجل الدخول للوصول إلى لوحة التحكم</p>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    رقم الهاتف
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={handlePhoneChange}
                    placeholder="أدخل رقم الهاتف"
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 outline-none ${phoneError ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {phoneError && (
                    <p className="mt-1 text-sm text-red-600">{phoneError}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    كلمة المرور
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={handlePasswordChange}
                    placeholder="••••••••"
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 outline-none ${passwordError ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {passwordError && (
                    <p className="mt-1 text-sm text-red-600">{passwordError}</p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loginMutation.isPending}
                  className="w-full bg-gradient-to-r from-red-900 to-red-700 text-white py-3 px-4 rounded-xl font-semibold hover:from-red-800 hover:to-red-600 focus:ring-4 focus:ring-red-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  {loginMutation.isPending ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      جاري تسجيل الدخول...
                    </span>
                  ) : (
                    "تسجيل الدخول"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
