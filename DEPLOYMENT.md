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
5. Create a database user
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
   - **Region**: Choose the one closest to your users
   - **Branch**: `main` (or your production branch)
   - **Build Command**: `pnpm install --no-frozen-lockfile && pnpm build`
   - **Start Command**: `pnpm start`

### Option B: Using Render Blueprint (render.yaml)

1. Push your code to a GitHub/GitLab repository
2. Go to [Render Dashboard](https://dashboard.render.com/)
3. Click "New" and select "Blueprint"
4. Connect your repository
5. Render will automatically detect and use the `render.yaml` file

## 3. Configure Environment Variables

In your Render dashboard, go to your service and add these environment variables:

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
