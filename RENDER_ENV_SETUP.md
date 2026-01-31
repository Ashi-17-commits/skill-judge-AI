# Render Environment Variables Setup Guide

## Quick Setup Steps

### Backend Service (skill-judge-ai-tm61)

1. Log in to Render dashboard
2. Go to your backend service
3. Click "Environment" in the left sidebar
4. Verify these environment variables are set:

| Key | Value | Purpose |
|-----|-------|---------|
| `GROQ_API_KEY` | `gsk_xxxx...` | Your Groq API key for LLM |

✅ Backend is ready - no changes needed if GROQ_API_KEY already set

---

### Frontend Service (skill-judge-ai-86rg)

1. Log in to Render dashboard
2. Go to your frontend service
3. Click "Environment" in the left sidebar
4. Add this environment variable:

| Key | Value | Purpose |
|-----|-------|---------|
| `VITE_API_BASE_URL` | `https://skill-judge-ai-tm61.onrender.com` | Backend URL for API calls |

5. Click "Add" or "Save"
6. Trigger a new deploy:
   - Click "Manual Deploy" → "Deploy latest commit"
   - Or push a new commit to GitHub

---

## Verification

After setting the frontend environment variable and redeploying:

### Check Frontend Build
1. Go to Render dashboard → Frontend service → Logs
2. Look for build output showing:
   ```
   npm install && npm run build
   ```
3. Verify no errors in build

### Check Browser Console
1. Open https://skill-judge-ai-86rg.onrender.com
2. Open DevTools (F12) → Console tab
3. Should see:
   ```
   [API CONFIG] Backend URL: https://skill-judge-ai-tm61.onrender.com
   ```

### Test Upload
1. Upload a resume
2. Check Network tab:
   - Request URL: `https://skill-judge-ai-tm61.onrender.com/api/resume/upload`
   - Response Status: 201
   - Response Body: Valid JSON

---

## Troubleshooting

### "Backend URL: (using relative URLs)"
**Problem:** `VITE_API_BASE_URL` not set or empty
**Solution:** 
1. Go to frontend service Environment settings
2. Add `VITE_API_BASE_URL = https://skill-judge-ai-tm61.onrender.com`
3. Manual redeploy

### Request goes to wrong URL
**Problem:** Build didn't pick up the environment variable
**Solution:**
1. Go to frontend service
2. Settings → Clear all data and redeploy
3. Wait for build to complete

### Still getting CORS errors
**Problem:** Backend CORS configuration issue
**Solution:**
1. Check backend logs for CORS errors
2. Verify frontend origin in error message
3. Backend CORS is already configured for `https://skill-judge-ai-86rg.onrender.com`
4. If different domain, update `app/main.py` allowed_origins and redeploy

---

## Environment Variables Summary

**Frontend (.env.production):**
```
VITE_API_BASE_URL=https://skill-judge-ai-tm61.onrender.com
```

**Backend (no frontend-facing env vars needed):**
```
GROQ_API_KEY=<your-key>
```

That's it! The connection is now:
1. ✅ Secure (HTTPS only)
2. ✅ Environment-driven (no hardcoded URLs)
3. ✅ Production-ready (CORS restricted)
4. ✅ Fully typed and logged
