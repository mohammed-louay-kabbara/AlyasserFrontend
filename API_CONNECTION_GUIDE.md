# API Connection Guide - Al-Yaser Dashboard

## **Arabic Interface Complete!** 

The dashboard now has a complete Arabic interface with:
- **Sidebar**: All menu items in Arabic
- **Header**: Arabic welcome message and user info
- **All Pages**: Full Arabic content throughout

## **API Configuration**

### **Current Setup:**
- **Base URL**: `http://127.0.0.1:8000/api`
- **Authentication**: JWT Bearer Token
- **Headers**: Automatic token injection
- **Error Handling**: 401 auto-redirect to login

### **API Endpoints Ready:**

#### **Authentication**
- `POST /api/login` - User login
- Headers: `Content-Type: application/json`
- Body: `{ "email": "user@example.com", "password": "password" }`
- Response: `{ "user": {...}, "token": "jwt_token" }`

#### **Users Management**
- `GET /api/users` - Get all users
- `POST /api/users/{id}/approve` - Approve user
- `POST /api/users/{id}/reject` - Reject user
- `POST /api/users/{id}/toggle-status` - Toggle user status

#### **Products Management**
- `GET /api/products` - Get all products
- `GET /api/categories` - Get all categories
- `DELETE /api/products/{id}` - Delete product

#### **Orders Management**
- `GET /api/orders` - Get all orders
- `PUT /api/orders/{id}/status` - Update order status
- `GET /api/orders/{id}` - Get order details

#### **Categories Management**
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category
- `PUT /api/categories/{id}` - Update category
- `DELETE /api/categories/{id}` - Delete category

#### **Offers Management**
- `GET /api/offers` - Get all offers
- `POST /api/offers` - Create offer
- `DELETE /api/offers/{id}` - Delete offer

#### **Warehouse Management**
- `GET /api/warehouses` - Get all warehouses
- `GET /api/warehouses/stats` - Get warehouse statistics
- `GET /api/warehouses/{id}/orders` - Get warehouse orders

#### **Notifications Management**
- `GET /api/notifications` - Get all notifications
- `POST /api/notifications/send` - Send notification

#### **Exchange Rate**
- `GET /api/exchange-rate` - Get current USD to SYP rate

## **Database Schema Requirements**

### **Users Table**
```sql
users (
  id, name, email, phone, address, 
  role (admin/customer/warehouse_manager/driver),
  status (pending/active/inactive/rejected),
  created_at, updated_at
)
```

### **Products Table**
```sql
products (
  id, name, description, price_piece, price_carton,
  quantity, category_id, image_url,
  created_at, updated_at
)
```

### **Categories Table**
```sql
categories (
  id, name, description, created_at, updated_at
)
```

### **Orders Table**
```sql
orders (
  id, customer_name, customer_phone, customer_address,
  total_amount, currency, payment_method,
  status (pending/processing/ready/delivered/cancelled),
  priority (low/medium/high/urgent),
  created_at, updated_at
)
```

### **Offers Table**
```sql
offers (
  id, title, description, discount_percentage,
  start_date, end_date, status (active/expired/scheduled),
  created_at, updated_at
)
```

### **Warehouses Table**
```sql
warehouses (
  id, name, address, phone, manager_name,
  status (active/inactive), created_at, updated_at
)
```

### **Notifications Table**
```sql
notifications (
  id, title, message, type (general/order/promotion/system),
  is_read, created_at, updated_at
)
```

## **Testing the API Connection**

### **Step 1: Start Your Laravel API**
```bash
cd /path/to/your/laravel-project
php artisan serve --port=8080
```

### **Step 2: Test Login Endpoint**
```bash
curl -X POST http://127.0.0.1:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@alyaser.com", "password": "password"}'
```

### **Step 3: Test Dashboard Login**
1. Open dashboard: http://localhost:5173
2. Use real credentials from your database
3. Should connect to your Laravel API

### **Step 4: Verify Data Loading**
- Check browser console for API calls
- Verify real data appears in dashboard
- Test CRUD operations

## **Common Issues & Solutions**

### **CORS Issues**
Add to your Laravel `config/cors.php`:
```php
'paths' => ['api/*', 'sanctum/csrf-cookie'],
'allowed_methods' => ['*'],
'allowed_origins' => ['http://localhost:5173'],
'allowed_headers' => ['*'],
```

### **JWT Authentication**
Make sure your Laravel API has JWT configured:
```bash
composer require tymon/jwt-auth
php artisan vendor:publish --provider="Tymon\JWTAuth\Providers\JWTAuthServiceProvider"
php artisan jwt:secret
```

### **Database Connection**
Ensure your `.env` file has correct database settings:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=alyaser_db
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

## **Next Steps**

1. **Start your Laravel API server**
2. **Test the login endpoint**
3. **Verify dashboard connects to real data**
4. **Test all CRUD operations**
5. **Verify Arabic data displays correctly**

## **Real Data Features**

Once connected to your API, the dashboard will:
- Show real user statistics
- Display actual products and inventory
- Process real orders
- Manage real categories and offers
- Send actual notifications
- Track real warehouse data

**The dashboard is now ready for full API integration!**
