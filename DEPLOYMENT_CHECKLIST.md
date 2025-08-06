# Production Deployment Checklist

## Pre-Deployment Checks

### Environment Variables
- [ ] Create `.env.production` file with all required variables (see `.env.example`)
- [ ] Verify all sensitive variables are properly set (secrets, API keys, etc.)
- [ ] Ensure `NODE_ENV` is set to `production`
- [ ] Verify database connection strings are correct for production

### Build Process
- [ ] Run `pnpm build` successfully completes without errors
- [ ] Verify `.next` directory contains all built assets
- [ ] Check bundle size and optimize if necessary

### Security
- [ ] Ensure all dependencies are up to date (`pnpm outdated`)
- [ ] Verify CORS settings are properly configured
- [ ] Check that rate limiting is enabled
- [ ] Verify HTTPS is enforced

## Deployment Steps

### Option 1: Docker Deployment
1. Build Docker image:
   ```bash
   docker build -t coworking-platform .
   ```
2. Run container:
   ```bash
   docker run -p 3000:3000 --env-file .env.production coworking-platform
   ```

### Option 2: Direct Deployment
1. Install production dependencies:
   ```bash
   pnpm install --prod
   ```
2. Start production server:
   ```bash
   pnpm start
   ```

## Post-Deployment Verification

### Health Checks
- [ ] Verify `/api/health` endpoint returns 200 OK
- [ ] Check application logs for any errors
- [ ] Verify all routes are accessible

### Functionality Tests
- [ ] Test authentication flows
- [ ] Verify database connections
- [ ] Check file uploads and storage
- [ ] Test email sending (if applicable)

### Monitoring
- [ ] Set up error tracking (e.g., Sentry, LogRocket)
- [ ] Configure logging and monitoring
- [ ] Set up alerts for critical issues

## Rollback Plan
1. Keep previous version ready for quick rollback
2. Test rollback procedure
3. Document rollback steps

## Maintenance
- [ ] Schedule regular backups
- [ ] Monitor resource usage
- [ ] Set up log rotation
- [ ] Document any manual steps required for updates

## Performance
- [ ] Enable caching where appropriate
- [ ] Optimize database queries
- [ ] Set up CDN for static assets
- [ ] Configure proper HTTP headers for caching
