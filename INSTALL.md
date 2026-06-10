# Installation Instructions

## Due to PowerShell Script Restrictions

If you're encountering PowerShell script execution policy issues, follow these steps:

### Option 1: Enable Script Execution (Recommended)
1. Open PowerShell as Administrator
2. Run: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`
3. Confirm with "Y" when prompted
4. Then run: `npm install`

### Option 2: Use Command Prompt
1. Open Command Prompt (cmd) instead of PowerShell
2. Navigate to the project directory:
   ```
   cd "c:/Users/KIIT/Documents/Osama Mahmoud/Job/Al Yasser/Web based control dashboard/alyaser-dashboard"
   ```
3. Run: `npm install`

### Option 3: Manual Package Installation
Create the node_modules folder structure manually or use a package manager like yarn:
```
yarn install
```

## After Installation

Once dependencies are installed, start the development server:
```bash
npm run dev
```

The dashboard will be available at: http://localhost:5173

## Default Login
For testing, you can use any email/password combination as the API will validate against the Laravel backend.

## API Connection
Make sure the Laravel API is running at: http://alyasser-center.com:8080/api
