# Vercel Environment Variables Setup

## Required Environment Variables for Production

Add these to your Vercel project settings:

### 1. Database Connection

```
DATABASE_URL=your_supabase_connection_string
```

### 2. Better Auth Configuration

```
BETTER_AUTH_URL=https://dbms-project-web-mocha.vercel.app
NEXT_PUBLIC_BETTER_AUTH_URL=https://dbms-project-web-mocha.vercel.app
```

### 3. Node Environment

```
NODE_ENV=production
```

## How to Set in Vercel

1. Go to your Vercel dashboard
2. Select your project: `dbms-project-web`
3. Go to Settings → Environment Variables
4. Add each variable listed above
5. Make sure to redeploy after adding the variables

## Verification

After deployment, check that:

- Login redirects properly to `/web-series`
- Cookies are being set (check browser dev tools → Application → Cookies)
- The `/api/auth/sign-in/email` endpoint returns proper response with redirect
