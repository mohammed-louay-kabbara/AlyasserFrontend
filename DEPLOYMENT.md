# Production Deployment Guide

## Overview
This guide ensures the Al-Yaser Dashboard works seamlessly in production without CORS or connection issues.

## Environment Configuration

### Development vs Production
- **Development**: Uses mock data fallback when live server is unreachable
- **Production**: Connects directly to live API server

## Production Setup Options

### Option 1: Same Domain Deployment (Recommended)
Deploy frontend and API on the same domain to eliminate CORS issues.

**Example Setup:**
```
Frontend: https://dashboard.alyasser-center.com
API:      https://dashboard.alyasser-center.com/api
```

### Option 2: Different Domains with CORS
If frontend and API are on different domains, configure CORS headers on the server.

**Server CORS Configuration:**
```javascript
// Laravel example - in routes/api.php
header('Access-Control-Allow-Origin: https://your-frontend-domain.com');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
```

## Configuration Files

### 1. API Configuration (`src/constants/config.ts`)
```typescript
// Production-ready configuration
export const API_BASE_URL = "http://127.0.0.1:8000/api";

export const PRODUCTION_CONFIG = {
  SAME_DOMAIN: false, // Set to true if frontend and API are on same domain
  API_TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
};

export const FALLBACK_CONFIG = {
  ENABLE_MOCK_FALLBACK: true, // Keep for resilience
  SHOW_CONSOLE_ERRORS: false, // Disable in production
};
```

### 2. Environment Variables
Create `.env.production` file:
```
REACT_APP_API_URL=https://api.alyasser-center.com/api
REACT_APP_ENV=production
```

## Build and Deployment

### 1. Build for Production
```bash
npm run build
```

### 2. Deploy to Server
Upload the `build/` folder to your web server.

### 3. Server Configuration
Ensure your server serves static files and handles routing correctly.

## CORS Solutions

### Solution A: Same Domain (Easiest)
Deploy both frontend and API to the same domain.

### Solution B: Proxy Configuration
Use a reverse proxy to serve both frontend and API.

**Nginx Example:**
```nginx
server {
    listen 80;
    server_name dashboard.alyasser-center.com;

    # Frontend
    location / {
        root /path/to/build;
        try_files $uri $uri/ /index.html;
    }

    # API
    location /api {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Solution C: Server CORS Headers
Configure CORS headers on your API server.

## Production Checklist

### Before Deployment
- [ ] Update `API_BASE_URL` to production URL
- [ ] Set `SHOW_CONSOLE_ERRORS` to `false`
- [ ] Test API connectivity
- [ ] Verify authentication works
- [ ] Test all CRUD operations

### After Deployment
- [ ] Verify frontend loads correctly
- [ ] Test login functionality
- [ ] Test CRUD operations
- [ ] Check for console errors
- [ ] Verify error handling works

## Troubleshooting

### CORS Issues
If you see CORS errors in production:
1. Check if frontend and API are on different domains
2. Verify CORS headers are configured on the server
3. Consider using a proxy or same-domain deployment

### Connection Issues
If API calls fail:
1. Check API server is running
2. Verify the API URL is correct
3. Check network connectivity
4. Verify authentication tokens

### Performance Issues
1. Enable API response caching
2. Optimize image sizes
3. Minimize API calls
4. Use CDN for static assets

## Security Considerations

### Production Security
- [ ] Use HTTPS in production
- [ ] Validate all API responses
- [ ] Sanitize user inputs
- [ ] Implement rate limiting
- [ ] Secure authentication tokens

### API Security
- [ ] Validate all incoming requests
- [ ] Implement proper authentication
- [ ] Use HTTPS for API calls
- [ ] Sanitize database inputs
- [ ] Implement proper error handling

## Monitoring

### Production Monitoring
- Monitor API response times
- Track error rates
- Monitor user authentication
- Log critical errors
- Set up alerts for issues

### Health Checks
Implement health check endpoints:
- `/api/health` - API status
- Database connectivity
- Authentication status
- Response time monitoring

## Support

For production issues:
1. Check console errors
2. Verify API connectivity
3. Review server logs
4. Test with different browsers
5. Contact support if issues persist

## Notes

- The app includes robust fallback mechanisms
- Mock data provides resilience during outages
- Error handling ensures smooth user experience
- Configuration is flexible for different deployment scenarios
