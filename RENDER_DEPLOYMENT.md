# Render Backend Deployment Guide

This guide will help you deploy only the backend of your Project Management Tool to Render.

## Prerequisites

1. A Render account (sign up at [render.com](https://render.com))
2. Your project code pushed to a Git repository (GitHub, GitLab, or Bitbucket)

## Deployment Steps

### 1. Connect Your Repository

1. Log in to your Render dashboard
2. Click "New +" and select "Web Service"
3. Connect your Git repository containing this project

### 2. Configure the Web Service

Use these settings when creating your web service:

- **Name**: `project-management-backend` (or your preferred name)
- **Runtime**: `Node`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm run start:prod`
- **Root Directory**: `backend`

### 3. Set Environment Variables

In the Render dashboard, add these environment variables:

#### Required Variables:
- `NODE_ENV`: `production`
- `PORT`: `10000` (Render will set this automatically)
- `JWT_SECRET`: Generate a secure random string

#### Database Variables (will be auto-populated when you add PostgreSQL):
- `DB_HOST`: (from PostgreSQL service)
- `DB_PORT`: `5432`
- `DB_USER`: (from PostgreSQL service)
- `DB_PASSWORD`: (from PostgreSQL service)
- `DB_NAME`: `pmtool`

#### Redis Variables (will be auto-populated when you add Redis):
- `REDIS_HOST`: (from Redis service)
- `REDIS_PORT`: `6379`

#### Optional:
- `ELASTICSEARCH_NODE`: Configure if you need search functionality
- `CORS_ORIGIN`: Set to your frontend URL if hosting frontend elsewhere

### 4. Add Database Services

#### PostgreSQL Database:
1. In Render dashboard, click "New +" → "PostgreSQL"
2. Name: `project-management-db`
3. Database Name: `pmtool`
4. Plan: Choose based on your needs (Free tier available)

#### Redis:
1. In Render dashboard, click "New +" → "Redis"
2. Name: `project-management-redis`
3. Plan: Choose based on your needs (Free tier available)

### 5. Deploy Using render.yaml (Alternative Method)

If you prefer Infrastructure as Code, you can use the included `render.yaml` file:

1. In your Render dashboard, go to "Blueprint"
2. Click "New Blueprint Instance"
3. Connect your repository
4. Render will automatically read the `render.yaml` file and create all services

## Post-Deployment

### 1. Health Check
Your backend will be available at: `https://your-service-name.onrender.com`

Test the health endpoint: `https://your-service-name.onrender.com/api/users/health`

### 2. API Documentation
Swagger documentation will be available at: `https://your-service-name.onrender.com/api/docs`

### 3. Seed Admin User
Create an admin user by making a POST request to:
```bash
curl -X POST https://your-service-name.onrender.com/api/users/seed-admin \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

### 4. Test Authentication
Login with the admin user:
```bash
curl -X POST https://your-service-name.onrender.com/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

## Important Notes

1. **Free Tier Limitations**: Render's free tier services spin down after 15 minutes of inactivity
2. **Database Persistence**: Use paid PostgreSQL for production to ensure data persistence
3. **CORS Configuration**: Update CORS settings in `main.ts` if your frontend is hosted elsewhere
4. **Environment Variables**: Never commit sensitive environment variables to your repository

## Troubleshooting

### Common Issues:

1. **Build Fails**: Check that all dependencies are listed in `package.json`
2. **Database Connection**: Ensure database environment variables are correctly set
3. **Port Issues**: Render automatically sets the PORT environment variable to 10000
4. **Health Check Fails**: Verify the health endpoint is accessible at `/api/users/health`

### Logs:
Check your service logs in the Render dashboard for detailed error information.

## Frontend Integration

If you're hosting your frontend elsewhere, update the API URL to point to your Render backend:
```
NEXT_PUBLIC_API_URL=https://your-service-name.onrender.com
```

## Support

For Render-specific issues, check the [Render documentation](https://render.com/docs) or contact Render support.