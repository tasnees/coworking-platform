# Deployment Guide

This guide will walk you through deploying the Coworking Platform to Render.

## Prerequisites

- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/) (v20.x LTS recommended)
- [PNPM](https://pnpm.io/) (v8.10.0 or later)
- A [Render](https://render.com/) account
- A [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) database

## 1. Set Up MongoDB Atlas

1. Log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new project (if you haven't already)
3. Build a new cluster (free tier available)
4. Add your connection IP to the IP access list
5. Create a database user with read/write access
6. Get your connection string (replace placeholders with your credentials):
   ```
   mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
   ```

## 2. Deploy to Render

### Option A: Using Render Dashboard (Recommended)

1. Push your code to a GitHub/GitLab repository
2. Go to [Render Dashboard](https://dashboard.render.com/)
3. Click "New" and select "Web Service"
4. Connect your repository
5. Configure the service:
   - **Name**: `coworking-platform`
   - **Region**: `singapore` (or choose the one closest to your users)
   - **Branch**: `main` (or your production branch)
   - **Build Command**: See the `build` script in `package.json`
   - **Start Command**: `pnpm start`
   - **Auto-Deploy**: Enable for automatic deployments on push to the selected branch

### Option B: Using Render Blueprint (render.yaml)

1. Push your code to a GitHub/GitLab repository
2. Go to [Render Dashboard](https://dashboard.render.com/)
3. Click "New" and select "Blueprint"
4. Connect your repository
5. Render will automatically detect and use the `render.yaml` file

## 3. Configure Environment Variables

In your Render dashboard, go to your service and add these environment variables:

### Required Environment Variables

```
# Next.js
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-production-url.com
NEXT_TELEMETRY_DISABLED=1
NEXT_SHARP_PATH=/usr/local/lib/node_modules/sharp

# Authentication
NEXTAUTH_URL=https://your-production-url.com
NEXTAUTH_SECRET=your_nextauth_secret_here

# Database
MONGODB_URI=your_mongodb_connection_string
```

### Optional Environment Variables

```
# Email Provider (Example using Nodemailer)
EMAIL_SERVER=smtp://username:password@smtp.example.com:587
EMAIL_FROM=noreply@yourdomain.com

# OAuth Providers (if used)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# API Keys
MAPBOX_ACCESS_TOKEN=your_mapbox_token
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

## 4. Build and Runtime Configuration

The application is configured with the following settings in `next.config.js`:

- **Output**: Standalone (enables optimized production builds)
- **Image Optimization**: Enabled with WebP and AVIF formats
- **Security Headers**: Enabled with secure defaults
- **Caching**: Configured for optimal performance

## 5. Health Check Endpoint

The application includes a health check endpoint at `/api/health` that returns a 200 status when the application is running correctly. This is configured in `render.yaml`.

## 6. Monitoring and Logs

- **Logs**: View application logs in the Render dashboard
- **Monitoring**: Consider setting up an external monitoring service (e.g., Sentry, LogRocket)
- **Error Tracking**: Implement error tracking for production monitoring

## 7. SSL/TLS

Render automatically provides SSL certificates for your production domain through Let's Encrypt. No additional configuration is needed.

## 8. Scaling

The application is configured to work with Render's auto-scaling. You can adjust the instance size and scaling settings in the Render dashboard based on your needs.

## 9. Custom Domains

To use a custom domain:
1. Go to your service in the Render dashboard
2. Click on "Settings"
3. Under "Custom Domains", click "Add Custom Domain"
4. Follow the instructions to verify domain ownership
5. Update your DNS settings as instructed

## 10. Troubleshooting

### Build Failures

1. Check the build logs in the Render dashboard for detailed error messages
2. Verify all environment variables are correctly set
3. Ensure the Node.js version in `package.json` matches the one in `render.yaml`
4. Check for dependency issues by running `pnpm install` locally

### Runtime Issues

1. Check the application logs in the Render dashboard
2. Verify the database connection string is correct
3. Ensure all required environment variables are set
4. Check the health check endpoint at `/api/health`

## 11. Updating the Application

1. Push changes to your repository
2. Render will automatically detect the changes and trigger a new deployment
3. Monitor the deployment in the Render dashboard

## 12. Rollback

If a deployment causes issues:
1. Go to your service in the Render dashboard
2. Click on "Deploys"
3. Find a previous working deployment
4. Click "Rollback" to revert to that version

```
NODE_ENV=production
NEXTAUTH_URL=https://your-render-url.onrender.com
NEXTAUTH_SECRET=your_secure_random_string
MONGODB_URI=your_mongodb_connection_string
NEXT_PUBLIC_APP_URL=https://your-render-url.onrender.com
```

To generate a secure `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

## 4. Custom Domain (Optional)

1. Go to your Render service settings
2. Click on "Custom Domains"
3. Add your domain and follow the instructions to verify ownership
4. Update your DNS settings to point to Render's servers

## 5. SSL/TLS

- Render automatically provisions SSL certificates for all services
- For custom domains, SSL is automatically configured when you add the domain

## 6. Monitoring

### Built-in Monitoring
- Render provides basic metrics (CPU, Memory, etc.)
- Check the "Metrics" tab in your Render dashboard

### Error Tracking (Recommended)
1. Sign up for [Sentry](https://sentry.io/)
2. Install the Sentry SDK:
   ```bash
   pnpm add @sentry/nextjs
   ```
3. Configure `sentry.client.config.js` and `sentry.edge.config.js`
4. Add your DSN as an environment variable:
   ```
   NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
   ```

## 7. Continuous Deployment

By default, Render will automatically deploy changes when you push to the connected branch. You can configure this in the service settings.

## 8. Troubleshooting

### Common Issues

1. **Build Failures**
   - Check the build logs in the Render dashboard
   - Ensure all environment variables are set
   - Verify Node.js and PNPM versions

2. **Database Connection Issues**
   - Verify your MongoDB Atlas IP whitelist includes Render's IPs
   - Check your connection string for typos
   - Ensure your database user has the correct permissions

3. **Environment Variables**
   - Double-check all required variables are set
   - Ensure no trailing spaces in values
   - Restart the service after making changes

## 9. Maintenance

### Updating Dependencies
```bash
# Update dependencies
pnpm update

# Test locally
pnpm dev

# Commit and push changes
git add package.json pnpm-lock.yaml
git commit -m "chore: update dependencies"
git push
```

### Database Backups
- MongoDB Atlas provides automatic backups for paid clusters
- For free clusters, consider setting up a scheduled export

## Support

If you encounter any issues, please check the [Render documentation](https://render.com/docs) or contact support.
