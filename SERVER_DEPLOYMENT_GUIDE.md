# Zero Production Deployment Guide

This guide provides step-by-step instructions for deploying Zero (0.email) to a production server. By following these instructions, you'll be able to get the application up and running with a single command.

## Prerequisites

- A Linux server with Docker and Docker Compose installed
- Domain name pointing to your server
- Basic understanding of command line operations

## Step 1: Clone the Repository

```bash
# Clone the repository
git clone https://github.com/Mail-0/Zero.git
cd Zero
```

## Step 2: Create Environment File

Create a `.env` file in the root directory with all required environment variables:

```bash
# Create .env file
touch .env
```

Add the following content to the `.env` file, replacing placeholders with your actual values:

```env
# Application URL - Update with your domain
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Database Password
POSTGRES_PASSWORD=your_secure_db_password

# Redis Configuration
REDIS_PASSWORD=your_secure_redis_password
REDIS_TOKEN=your_secure_redis_token

# Authentication 
# Generate with: openssl rand -hex 32
BETTER_AUTH_SECRET=your_generated_secret_key
BETTER_AUTH_URL=https://your-domain.com
BETTER_AUTH_TRUSTED_ORIGINS=https://your-domain.com

# Google OAuth (Required for Gmail integration)
# Get these from Google Cloud Console
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=https://your-domain.com/api/v1/mail/auth/google/callback

# GitHub OAuth (Optional)
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_REDIRECT_URI=https://your-domain.com/api/auth/callback/github

# Resend API Key (Optional, for email notifications)
RESEND_API_KEY=your_resend_api_key

# OpenAI API Key (Optional, for AI features)
OPENAI_API_KEY=your_openai_api_key

# AI System Prompt (Optional)
AI_SYSTEM_PROMPT="Your custom AI system prompt"
```

## Step 3: Google OAuth Setup (Required for Gmail integration)

Follow these steps to set up Google OAuth for Gmail integration:

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable the following APIs:
   - [People API](https://console.cloud.google.com/apis/library/people.googleapis.com)
   - [Gmail API](https://console.cloud.google.com/apis/library/gmail.googleapis.com)
4. Configure OAuth consent screen:
   - Set up an External or Internal user type
   - Add scopes for Gmail and People API
   - Add test users if you are using External user type
5. Create OAuth 2.0 credentials (Web application type)
6. Add authorized redirect URI:
   - `https://your-domain.com/api/v1/mail/auth/google/callback`
   - `https://your-domain.com/api/auth/callback/google`
7. Copy your Client ID and Client Secret to the `.env` file

## Step 4: Set Up Reverse Proxy (Optional but Recommended)

For better security, set up a reverse proxy (like Nginx or Traefik) to handle HTTPS and forward requests to your Zero application.

### Example Nginx Configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    # Redirect HTTP to HTTPS
    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl;
    server_name your-domain.com;
    
    # SSL Configuration
    ssl_certificate /path/to/fullchain.pem;
    ssl_certificate_key /path/to/privkey.pem;
    
    # Proxy to Zero
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Step 5: Deploy with Docker Compose

Start the application using Docker Compose:

```bash
# Build and start all services
docker-compose -f docker-compose.production.yml up -d
```

This will:
1. Build the Zero application
2. Set up PostgreSQL database
3. Set up Redis for caching
4. Start the Redis HTTP proxy
5. Connect all services together

## Step 6: Initialize the Database

After the containers are running, migrate the database schema:

```bash
# Execute command in the app container to push database schema
docker exec zerodotemail-app bun run db:push
```

## Step 7: Verify Deployment

Verify that all services are running correctly:

```bash
# Check container status
docker ps

# View application logs
docker logs zerodotemail-app
```

Visit your domain in a browser to access the application. You should see the Zero login page.

## Maintenance and Updates

### Updating the Application

To update the application to the latest version:

```bash
# Pull the latest code
git pull

# Rebuild and restart the containers
docker-compose -f docker-compose.production.yml down
docker-compose -f docker-compose.production.yml up -d --build
```

### Backing Up the Database

To back up the PostgreSQL database:

```bash
# Create a backup
docker exec zerodotemail-db pg_dump -U postgres zerodotemail > backup_$(date +%Y%m%d).sql
```

### Restoring the Database

To restore a database backup:

```bash
# Restore from backup
cat backup_file.sql | docker exec -i zerodotemail-db psql -U postgres zerodotemail
```

## Troubleshooting

### Database Connection Issues

If the application can't connect to the database:

```bash
# Check database logs
docker logs zerodotemail-db

# Verify environment variables
docker exec zerodotemail-app env | grep DATABASE_URL
```

### Redis Connection Issues

If there are issues with Redis:

```bash
# Check Redis logs
docker logs zerodotemail-redis

# Check Redis proxy logs
docker logs zerodotemail-redis-proxy
```

### Container Not Starting

If any container fails to start:

```bash
# View all container logs
docker-compose -f docker-compose.production.yml logs

# Check specific container
docker logs <container-name>
```

## Security Considerations

1. **Database and Redis Passwords**: Use strong, unique passwords for your database and Redis.
2. **Environment Variables**: Keep your `.env` file secure and never commit it to version control.
3. **HTTPS**: Always use HTTPS in production. Set up SSL with Let's Encrypt or a similar service.
4. **OAuth Security**: Verify redirect URIs are correctly configured to prevent OAuth hijacking.
5. **Regular Updates**: Keep all components updated to patch security vulnerabilities.

## Performance Optimization

For high-traffic instances, consider:

1. **Scaling**: Adjust container resources based on traffic.
2. **Database Tuning**: Configure PostgreSQL for optimal performance.
3. **Caching**: Utilize Redis effectively for caching.
4. **CDN**: Consider using a CDN for static assets.

## Conclusion

You now have Zero deployed on your production server. For further assistance, refer to the [GitHub repository](https://github.com/Mail-0/Zero) or the community forums. 