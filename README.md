# Al-Yaser Commercial Center Dashboard

A comprehensive React admin dashboard for Al-Yaser Commercial Center with full Arabic RTL support.

## Features

- **Arabic RTL Interface**: Full right-to-left layout with Arabic fonts
- **Authentication**: JWT-based login system
- **Dashboard**: Statistics and overview panels
- **User Management**: User approval, role management, and status control
- **Product Management**: Inventory tracking with low-stock alerts
- **Order Management**: Order processing and status tracking
- **Warehouse Management**: Multi-warehouse support
- **Notifications**: Push notification system
- **Real-time Exchange Rate**: Auto-updating currency conversion

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Routing**: React Router v6
- **State Management**: Zustand for auth, TanStack Query for API state
- **Styling**: Tailwind CSS v3 with RTL plugin
- **UI Components**: Custom components with shadcn/ui patterns
- **API Client**: Axios with interceptors
- **Charts**: Recharts
- **Notifications**: react-hot-toast
- **Icons**: Lucide React

## API Integration

The dashboard integrates with an existing Laravel API at:
```
http://alyasser-center.com:8080/api
```

## Quick Start

### Option 1: Use Batch Files (Recommended for Windows)
1. Double-click `install.bat` to install dependencies
2. Double-click `start-dev.bat` to start the development server
3. Open http://localhost:5173 in your browser

### Option 2: Manual Installation
1. Open Command Prompt (not PowerShell) as Administrator
2. Navigate to the project directory
3. Run: `npm install`
4. Run: `npm run dev`

### Option 3: PowerShell (if script execution is enabled)
1. Open PowerShell as Administrator
2. Run: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`
3. Navigate to project directory
4. Run: `npm install`
5. Run: `npm run dev`

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## Project Structure

```
src/
  api/           # API layer with axios interceptors
  components/
    ui/          # Reusable UI components
    layout/      # Layout components (Header, Sidebar)
    shared/      # Shared components
  pages/         # Page components
  store/         # Zustand stores
  hooks/         # Custom React hooks
  types/         # TypeScript type definitions
  utils/         # Utility functions
  constants/     # Configuration constants
```

## Authentication

The dashboard uses JWT Bearer tokens for authentication. Tokens are stored in localStorage and automatically included in API requests.

## RTL Support

- Full RTL layout with sidebar on the right
- Arabic fonts (Tajawal, Cairo)
- Proper text direction and icon positioning
- Arabic number formatting for SYP amounts

## Role-Based Access Control

Different user roles have access to different features:
- **Admin**: Full access to all features
- **Warehouse Manager**: Product and order management
- **Driver**: Order status updates only
- **Customer**: No dashboard access

## Development Notes

- All API calls use TanStack Query for caching and synchronization
- Forms use FormData for file uploads
- Error handling with Arabic error messages
- Responsive design for mobile and desktop
- Print-ready invoice layouts
