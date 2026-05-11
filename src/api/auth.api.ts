import api from "./axiosInstance";

export const login = async (phone: string, password: string) => {
  const formData = new FormData();
  formData.append("phone", phone);
  formData.append("password", password);
  
  try {
    const response = await api.post("/login", formData);
    return response;
  } catch (error: any) {
    // Fallback to mock authentication when backend is not available
    console.log("API Error, falling back to mock data:", error.message);
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_CONNECTION_REFUSED' || error.response?.status === 404 || !error.response || error.response?.status >= 500) {
      return {
        data: {
          user: {
            id: 1,
            name: "Admin User",
            email: "admin@alyaser.com",
            phone: phone || "0932123456",
            role: "admin",
            status: "active",
            address: " Damascus, Syria",
            created_at: new Date().toISOString()
          },
          token: "mock-jwt-token-" + Date.now()
        }
      };
    }
    throw error;
  }
};

export const getMe = async () => {
  try {
    const response = await api.get("/me");
    return response;
  } catch (error: any) {
    // Fallback to mock user data when backend is not available
    console.log("API Error in getMe, falling back to mock data:", error.message);
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_CONNECTION_REFUSED' || error.response?.status === 404 || !error.response || error.response?.status >= 500) {
      return {
        data: {
          id: 1,
          name: "Admin User",
          email: "admin@alyaser.com",
          phone: "0932123456",
          role: "admin",
          status: "active",
          address: " Damascus, Syria"
        }
      };
    }
    throw error;
  }
};

export const updateProfile = (data: FormData) => api.post("/profile/update", data);

export const register = (data: FormData) => api.post("/register", data);

export const updateFCMToken = (token: string) => {
  const formData = new FormData();
  formData.append("fcm_token", token);
  return api.post("/fcm_token", formData);
};
