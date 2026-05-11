import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { login } from "../../api/auth.api";
import { useAuthStore } from "../../store/authStore";
import { Eye, EyeOff, Mail, Lock, AlertCircle } from "lucide-react";

const ArabicLoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const navigate = useNavigate();
  const setAuth = useAuthStore((state: any) => state.setAuth);

  const loginMutation = useMutation({
    mutationFn: () => login(email, password),
    onSuccess: (response: any) => {
      const { user, token } = response.data;
      setAuth(user, token);
      toast.success("Welcome! Login successful");
      navigate("/");
    },
    onError: (error: any) => {
      if (error.response?.status === 401) {
        toast.error("Invalid credentials");
        setErrors({
          email: "Invalid email or password",
          password: "Invalid email or password"
        });
      } else {
        toast.error("Login failed. Please try again.");
        setErrors({
          email: "Connection error",
          password: "Connection error"
        });
      }
    },
  });

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    
    if (!email.trim()) {
      newErrors.email = "Please enter your email address";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = "Please enter a valid email address";
    }
    
    if (!password.trim()) {
      newErrors.password = "Please enter your password";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      loginMutation.mutate();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-teal-200 rounded-full filter blur-3xl opacity-70"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-200 rounded-full filter blur-3xl opacity-70"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-200 rounded-full filter blur-3xl opacity-70"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-teal-200 rounded-full filter blur-3xl opacity-70"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-md">
        {/* Logo/Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full shadow-lg mb-4">
            <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.97h-2v-2.09c0-1.14.85-2.09 1.88-2.09h2.09c1.03 0 1.88.95 1.88 2.09v2.09h-2.09c-1.03 0-1.88-.95-1.88-2.09z"/>
              <path d="M12 22c-1.11 0-2.08-.89-2.08-2h-1.92c0-1.11.89-2 2-2h1.92c1.11 0 2 .89 2 2z"/>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Al-Yaser</h1>
          <p className="text-gray-600 text-lg">Commercial Center</p>
          <div className="text-sm text-gray-500">Dashboard Management System</div>
        </div>

        {/* Login Card */}
        <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 8 0zM12 14a7 7 0 01-7 7h14a7 7 0 01-7-7z"/>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome Back</h2>
            <p className="text-gray-600">Login to access your dashboard</p>
          </div>

          {/* Error Display */}
          {(errors.email || errors.password) && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-red-700">
                {errors.email && <p>{errors.email}</p>}
                {errors.password && <p>{errors.password}</p>}
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div>
              <label className="block text-right text-gray-700 text-sm font-medium mb-2">
                <span className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>Email Address</span>
                </span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <Mail className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className={`w-full pr-10 pl-4 py-3 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all duration-200 text-right`}
                  style={{ direction: 'rtl' }}
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-right text-gray-700 text-sm font-medium mb-2">
                <span className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  <span>Password</span>
                </span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className={`w-full pr-10 pl-4 py-3 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all duration-200 text-right`}
                  style={{ direction: 'rtl' }}
                />
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 focus:border-emerald-500"
                />
                <span className="mr-2 text-sm text-gray-600">Remember me</span>
              </label>
              <a href="#" className="text-sm text-emerald-600 hover:text-emerald-500 font-medium">
                Forgot password?
              </a>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-emerald-600 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 focus:ring-offset-emerald-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loginMutation.isPending ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V8C12 4.582 7.582 4 12 4s8 3.582 8 8z"></path>
                  </svg>
                  Logging in...
                </span>
              ) : (
                "Login"
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="text-center text-sm text-gray-600">
            <p>Need help? Contact your system administrator</p>
            <p className="mt-2">© 2024 Al-Yaser Commercial Center</p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center justify-center space-x-4 text-sm text-gray-500">
            <span>Version 1.0.0</span>
            <span>·</span>
            <span>Secure Login</span>
            <span>·</span>
            <span>Powered by Laravel</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArabicLoginPage;
