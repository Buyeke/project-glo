# Project GLO - Installation & Deployment Guide

## Prerequisites

### System Requirements

- **Operating System:** Windows 10+, macOS 10.15+, or Linux (Ubuntu 20.04+)
- **Memory:** 4GB RAM minimum, 8GB recommended
- **Storage:** 2GB free disk space
- **Internet:** Stable broadband connection

### Required Software

1. **Node.js** (v18.0.0 or higher)
   - Download: https://nodejs.org/
   - Verify installation: `node --version`

2. **Git** (v2.30.0 or higher)
   - Download: https://git-scm.com/
   - Verify installation: `git --version`

3. **Bun** (package manager, v1.0.0+)
   - Install: `npm install -g bun`
   - Verify: `bun --version`

### Required Accounts

1. **Supabase Account**
   - Sign up: https://supabase.com
   - Create new project
   - Note project URL and anon key

2. **OpenAI Account** (for AI features)
   - Sign up: https://platform.openai.com
   - Generate API key
   - Add credits for usage

3. **PayPal Developer Account** (for donations)
   - Sign up: https://developer.paypal.com
   - Create sandbox/live credentials

4. **ElevenLabs Account** (optional, for voice)
   - Sign up: https://elevenlabs.io
   - Generate API key

## Installation Steps

### 1. Clone Repository

```bash
# Clone the repository
git clone https://github.com/your-org/project-glo.git

# Navigate to project directory
cd project-glo
```

### 2. Install Dependencies

```bash
# Install all npm packages
bun install

# This will install:
# - React & React DOM
# - Supabase client
# - UI libraries (shadcn/ui, Radix UI)
# - Routing (react-router-dom)
# - State management (tanstack-query)
# - Form handling (react-hook-form, zod)
# - and more...
```

### 3. Configure Environment Variables

Create a `.env` file in the project root:

```bash
# Copy the example file
cp .env.example .env
```

Edit `.env` with your credentials:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key-here

# API Keys (configured in Supabase secrets, not in .env)
# - OPENAI_API_KEY
# - PAYPAL_CLIENT_ID
# - PAYPAL_CLIENT_SECRET
# - ELEVENLABS_API_KEY
# - GOOGLE_CLIENT_ID
# - GOOGLE_SECRET_KEY
```

**Important:** Never commit `.env` file to version control.

### 4. Database Setup

#### Option A: Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run migrations from `supabase/migrations/` folder in order

#### Option B: Using Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Push all migrations
supabase db push
```

### 5. Configure Supabase Secrets

Add API keys as Supabase secrets (not in code):

```bash
# Using Supabase CLI
supabase secrets set OPENAI_API_KEY=your-key-here
supabase secrets set PAYPAL_CLIENT_ID=your-id-here
supabase secrets set PAYPAL_CLIENT_SECRET=your-secret-here
supabase secrets set ELEVENLABS_API_KEY=your-key-here
```

Or via Supabase Dashboard:
1. Go to Project Settings → Edge Functions
2. Add each secret manually

### 6. Deploy Edge Functions

```bash
# Deploy all edge functions
supabase functions deploy ai-chat-processor
supabase functions deploy search-knowledge
supabase functions deploy text-to-speech
supabase functions deploy voice-to-text
supabase functions deploy process-paypal-payment
supabase functions deploy paypal-webhook
supabase functions deploy google-calendar-sync
```

### 7. Configure Storage Buckets

Run this SQL in Supabase SQL Editor:

```sql
-- Create blog images bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('blog-images', 'blog-images', true);

-- Set up storage policies
CREATE POLICY "Anyone can view blog images"
ON storage.objects FOR SELECT
USING (bucket_id = 'blog-images');

CREATE POLICY "Admins can upload blog images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'blog-images' AND
  auth.uid() IN (SELECT user_id FROM team_members WHERE role = 'admin')
);
```

### 8. Seed Initial Data

```sql
-- Create first admin user (run after user signs up)
SELECT setup_admin_user('admin@projectglo.org', 'Admin Name');

-- Add initial services
INSERT INTO services (title, description, category, availability) VALUES
('Crisis Counseling', '24/7 trauma-informed counseling', 'Counseling', 'Available'),
('Legal Aid', 'Free legal consultation', 'Legal', 'Available'),
('Emergency Housing', 'Temporary shelter assistance', 'Housing', 'Available');

-- Add chatbot intents
INSERT INTO chatbot_intents (category, intent_key, keywords, response_template) VALUES
('emergency', 'immediate_danger', 
 '["danger", "unsafe", "threat", "hurt"]'::jsonb,
 '{"en": "I understand you need urgent help.", "sw": "Naelewa unahitaji msaada wa haraka."}'::jsonb
);
```

## Development Setup

### Running Locally

```bash
# Start development server
bun run dev

# Server will start at http://localhost:5173
```

### Running Tests

```bash
# Run all tests
bun test

# Run with coverage
bun test --coverage
```

### Building for Production

```bash
# Create production build
bun run build

# Output will be in /dist folder
```

## Deployment Options

### Option 1: Lovable Platform (Recommended)

1. Push code to GitHub
2. Connect repository to Lovable
3. Automatic deployment on push
4. Custom domain support available

### Option 2: Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production deployment
vercel --prod
```

Configuration in `vercel.json`:

```json
{
  "buildCommand": "bun run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "env": {
    "VITE_SUPABASE_URL": "@supabase-url",
    "VITE_SUPABASE_PUBLISHABLE_KEY": "@supabase-key"
  }
}
```

### Option 3: Netlify

1. Connect GitHub repository
2. Build command: `bun run build`
3. Publish directory: `dist`
4. Add environment variables in Netlify dashboard

### Option 4: Self-Hosted

```bash
# Build the project
bun run build

# Serve with nginx or Apache
# Point web server to /dist directory
```

Example nginx configuration:

```nginx
server {
    listen 80;
    server_name projectglo.org;
    root /var/www/project-glo/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;
}
```

## Post-Deployment Configuration

### 1. Configure Authentication Providers

In Supabase Dashboard → Authentication → Providers:

1. **Email**
   - Enable email/password authentication
   - Configure email templates
   - Set up SMTP (optional, uses Supabase default)

2. **Google OAuth** (optional)
   - Add Google Client ID and Secret
   - Configure authorized redirect URLs

### 2. Set Up Custom Domain

1. Add domain in hosting provider
2. Configure DNS records:
   ```
   A    @    185.158.133.1
   A    www  185.158.133.1
   ```
3. Wait for DNS propagation (up to 48 hours)
4. Enable SSL certificate (automatic on most platforms)

### 3. Configure PayPal Webhooks

1. Go to PayPal Developer Dashboard
2. Create webhook endpoint: `https://your-domain.com/functions/v1/paypal-webhook`
3. Subscribe to events:
   - PAYMENT.CAPTURE.COMPLETED
   - PAYMENT.CAPTURE.DENIED
4. Copy webhook ID to Supabase secrets

### 4. Google Calendar Integration

1. Create Google Cloud project
2. Enable Google Calendar API
3. Create OAuth 2.0 credentials
4. Add authorized redirect URI
5. Add credentials to Supabase secrets

## Troubleshooting

### Common Issues

#### Build Errors

```bash
# Clear cache and reinstall
rm -rf node_modules bun.lockb
bun install
```

#### Database Connection Issues

- Verify Supabase URL and key in `.env`
- Check project status in Supabase dashboard
- Ensure RLS policies are correct

#### Edge Function Errors

```bash
# View function logs
supabase functions logs ai-chat-processor

# Redeploy function
supabase functions deploy ai-chat-processor
```

#### Missing Environment Variables

- Check `.env` file exists and has correct values
- Verify Supabase secrets are set
- Restart development server after changes

### Getting Help

- **Documentation:** https://docs.projectglo.org
- **GitHub Issues:** https://github.com/your-org/project-glo/issues
- **Email Support:** support@projectglo.org

## Security Checklist

- [ ] All API keys stored in Supabase secrets (not in code)
- [ ] RLS policies enabled on all tables
- [ ] HTTPS enabled (SSL certificate)
- [ ] CORS configured properly
- [ ] Rate limiting enabled
- [ ] Input validation on all forms
- [ ] Security headers configured
- [ ] Regular security audits scheduled

## Maintenance

### Regular Updates

```bash
# Update dependencies
bun update

# Check for security vulnerabilities
bun audit

# Update Supabase
supabase db pull
```

### Backup Strategy

1. **Database Backups**
   - Supabase provides automatic daily backups
   - Manual backups via dashboard or CLI
   - Retention: 7 days (can be extended)

2. **File Storage Backups**
   - Download storage buckets regularly
   - Store in separate location

3. **Code Backups**
   - Maintain Git repository
   - Tag releases for version tracking

### Monitoring

- Set up Supabase alerts for errors
- Monitor edge function logs
- Track API usage and costs
- Regular security log reviews

---

**Document Version:** 1.0  
**Last Updated:** 2025-01-10  
**Estimated Setup Time:** 2-3 hours  
**Support:** support@projectglo.org
