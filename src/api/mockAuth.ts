// Mock authentication for testing without API
export const mockLogin = (email: string, password: string) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Accept any email/password for testing
      if (email && password) {
        resolve({
          data: {
            user: {
              id: 1,
              name: "Admin User",
              email: email,
              phone: "+963 123 456 789",
              address: "Damascus, Syria",
              role: "admin",
              status: "active",
              created_at: new Date().toISOString(),
            },
            token: "mock-jwt-token-for-testing"
          }
        });
      } else {
        reject(new Error("Invalid credentials"));
      }
    }, 1000); // Simulate API delay
  });
};
