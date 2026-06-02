# Deployment Guide

This guide covers deploying the Solar-2 project to various platforms.

## Overview

| Platform             | Setup  | Cost        | Best For                  |
| -------------------- | ------ | ----------- | ------------------------- |
| **Firebase Hosting** | 5 min  | Free tier   | Production app            |
| **GitHub Pages**     | 10 min | Free        | Static sites, .io domains |
| **Vercel**           | 5 min  | Free tier   | Next.js apps              |
| **Cloud Run**        | 20 min | Pay-per-use | Backend API               |

---

## Option 1: Firebase Hosting (Recommended)

### Requirements

- Firebase project created
- Firebase CLI installed
- Built frontend (Next.js static export)

### Step 1: Configure Next.js for Static Export

In `frontend/next.config.mjs`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
```

### Step 2: Build Frontend

```bash
cd frontend
npm run build
```

This creates `frontend/out` directory with static files.

### Step 3: Deploy to Firebase Hosting

```bash
firebase deploy --only hosting
```

Your app will be live at: `https://YOUR_PROJECT_ID.web.app`

### Step 4: Set Up Custom Domain (Optional)

1. Go to Firebase Console → Hosting → Add custom domain
2. Follow DNS verification steps
3. Wait for SSL certificate (24-48 hours)

---

## Option 2: GitHub Pages with .io Domain

### Requirements

- GitHub repository set up
- GitHub Pages enabled
- Custom domain (optional)

### Step 1: Enable GitHub Pages

1. Go to GitHub repo → Settings → Pages
2. Select "GitHub Actions" as source
3. Click "Save"

### Step 2: Create GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: "18"

      - name: Install dependencies
        run: cd frontend && npm install

      - name: Build
        run: cd frontend && npm run build

      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./frontend/out
```

### Step 3: Push to GitHub

```bash
git add .
git commit -m "Add GitHub Pages deployment"
git push origin main
```

Your app will be live at: `https://YOUR_USERNAME.github.io/solar-2`

### Step 4: Add Custom .io Domain (Optional)

1. Purchase domain (e.g., solar-ai.io)
2. Go to GitHub repo → Settings → Pages
3. Under "Custom domain", enter your domain
4. Update DNS records at your registrar:

```
Type    Name    Value
A       @       185.199.108.153
A       @       185.199.109.153
A       @       185.199.110.153
A       @       185.199.111.153
CNAME   www     YOUR_USERNAME.github.io
```

5. Wait for DNS propagation (5-48 hours)

---

## Option 3: Vercel Deployment

### Step 1: Connect to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Import Project"
3. Select your GitHub repository

### Step 2: Configure

- **Framework Preset**: Next.js
- **Root Directory**: frontend
- **Build Command**: npm run build
- **Output Directory**: .next

### Step 3: Deploy

Click "Deploy" - Vercel will handle everything automatically.

Your app will be live at: `https://YOUR_PROJECT.vercel.app`

---

## Option 4: Docker + Cloud Run

### Step 1: Build Docker Image

From project root:

```bash
docker build -f backend/Dockerfile -t gcr.io/YOUR_PROJECT_ID/solar-api:latest .
```

### Step 2: Push to Google Container Registry

```bash
docker push gcr.io/YOUR_PROJECT_ID/solar-api:latest
```

### Step 3: Deploy to Cloud Run

```bash
gcloud run deploy solar-api \
  --image gcr.io/YOUR_PROJECT_ID/solar-api:latest \
  --platform managed \
  --region us-central1 \
  --set-env-vars DATABASE_URL=... \
  --set-env-vars REDIS_URL=...
```

Your API will be live at: `https://solar-api-HASH.run.app`

---

## Environment Variables Setup

### Frontend (.env.local)

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=solar-ai-prod.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=solar-ai-prod
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=solar-ai-prod.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789...
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc...
```

### Backend (backend/.env)

```bash
DATABASE_URL=postgresql://user:password@localhost:5432/solar
REDIS_URL=redis://localhost:6379
MODEL_PATH=/app/trained-models
LOG_LEVEL=INFO
```

---

## Deployment Checklist

- [ ] Firebase project created
- [ ] Environment variables configured
- [ ] Frontend built successfully
- [ ] Backend tests passing
- [ ] Docker image builds
- [ ] Database migrations run
- [ ] Security rules deployed
- [ ] Custom domain DNS configured
- [ ] SSL certificate generated
- [ ] Monitoring set up
- [ ] Backups configured

---

## Post-Deployment

### Health Checks

```bash
# Frontend
curl https://your-app.web.app

# Backend
curl https://your-api.run.app/api/v1/health
```

### Monitoring

**Firebase:**

- Go to Firebase Console → Analytics
- Monitor user activity and errors

**Cloud Run:**

```bash
gcloud run services describe solar-api --region us-central1
gcloud logging read "resource.type=cloud_run_revision" --limit 50
```

**GitHub Pages:**

- Check GitHub Actions for deployment status
- View site analytics in GitHub Insights

---

## Rollback

### Firebase Hosting

```bash
firebase hosting:channels:list
firebase hosting:channels:deploy CHANNEL_ID
```

### GitHub Pages

```bash
git revert HEAD
git push origin main
```

### Cloud Run

```bash
gcloud run deploy solar-api --image gcr.io/...PREVIOUS_IMAGE...
```

---

## Cost Optimization

### Firebase Hosting

- **Free**: 10 GB storage, 360 MB transfer/day
- **Paid**: $0.18/GB storage, $0.15/GB transfer

### Cloud Run

- **Free**: 2M requests/month, 360K CPU seconds/month
- **Paid**: $0.40/million requests, $0.00002500/CPU-second

### Recommendations

- Use Firebase Hosting for frontend (free tier sufficient)
- Use Cloud Run for backend (pay-per-use, auto-scales)
- Set up billing alerts on GCP Console
- Monitor usage monthly

---

## Troubleshooting

### "Firebase not initialized"

```bash
# Ensure .env.local exists in frontend directory
ls frontend/.env.local
```

### "Build fails"

```bash
# Clear cache and rebuild
rm -rf frontend/.next
cd frontend && npm run build
```

### "DNS not resolving"

```bash
# Check DNS propagation
dig your-domain.io
nslookup your-domain.io
```

### "GitHub Pages shows 404"

```bash
# Check publish directory
cat .github/workflows/deploy.yml | grep publish_dir
```

---

## Next Steps

1. Choose deployment platform
2. Follow setup steps above
3. Test in staging environment
4. Deploy to production
5. Monitor performance
6. Set up CI/CD automation
