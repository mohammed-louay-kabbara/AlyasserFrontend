// Mock data service for when API is not available
export const mockUsers = {
  data: [
    { id: 1, name: " Ahmed Hassan", phone: "0932123456", status: "active", role: "admin", email: "ahmed@example.com" },
    { id: 2, name: " Mohammed Ali", phone: "0933123457", status: "active", role: "user", email: "mohammed@example.com" },
    { id: 3, name: " Fatima Al-Rashid", phone: "0934123458", status: "pending", role: "user", email: "fatima@example.com" },
    { id: 4, name: " Omar Khalid", phone: "0935123459", status: "active", role: "manager", email: "omar@example.com" },
    { id: 5, name: " Layla Mahmoud", phone: "0936123460", status: "pending", role: "user", email: "layla@example.com" }
  ]
};

export const mockOrders = {
  data: [
    { 
      id: 1, 
      status: "delivered", 
      total_amount: 15000, 
      created_at: new Date(Date.now() - 86400000).toISOString() // Yesterday
    },
    { 
      id: 2, 
      status: "processing", 
      total_amount: 8500, 
      created_at: new Date().toISOString() // Today
    },
    { 
      id: 3, 
      status: "pending", 
      total_amount: 22000, 
      created_at: new Date(Date.now() - 172800000).toISOString() // 2 days ago
    },
    { 
      id: 4, 
      status: "delivered", 
      total_amount: 12000, 
      created_at: new Date(Date.now() - 259200000).toISOString() // 3 days ago
    },
    { 
      id: 5, 
      status: "ready", 
      total_amount: 18500, 
      created_at: new Date(Date.now() - 432000000).toISOString() // 5 days ago
    }
  ]
};

export const mockProducts = {
  data: [
    { id: 1, name: "Product A", quantity: 25, price_piece: 150, price_carton: 1500 },
    { id: 2, name: "Product B", quantity: 3, price_piece: 200, price_carton: 2000 },
    { id: 3, name: "Product C", quantity: 12, price_piece: 75, price_carton: 750 },
    { id: 4, name: "Product D", quantity: 8, price_piece: 120, price_carton: 1200 },
    { id: 5, name: "Product E", quantity: 15, price_piece: 90, price_carton: 900 }
  ]
};

export const mockOffers = {
  data: [
    {
      id: 1,
      description: "Special discount on beverages",
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      product_id: 1,
      image: "/src/public/offer-images/offer1.jpg",
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      description: "Weekend special on snacks",
      expires_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      product_id: 2,
      image: "/src/public/offer-images/offer2.jpg",
      created_at: new Date().toISOString()
    },
    {
      id: 3,
      description: "Dairy products promotion",
      expires_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      product_id: 3,
      image: "/src/public/offer-images/offer3.jpg",
      created_at: new Date().toISOString()
    }
  ]
};

export const mockExchangeRate = {
  data: {
    rate: 12500,
    updated_at: new Date().toISOString()
  }
};
