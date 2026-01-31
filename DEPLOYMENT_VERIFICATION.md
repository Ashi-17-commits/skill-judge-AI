# Production Connection Setup - Deployment Checklist

## Overview
This document provides a checklist for verifying that the frontend and backend are correctly connected in production on Render.

**Live URLs:**
- Frontend: https://skill-judge-ai-86rg.onrender.com
- Backend: https://skill-judge-ai-tm61.onrender.com

---

## Backend Configuration ✅

### CORS Settings
**File:** `skill-judge-ai-backend/app/main.py`

✅ **Status:** Configured for production
- Allowed Origins:
  - `https://skill-judge-ai-86rg.onrender.com` (production frontend)
  - `http://localhost:5173`, `http://localhost:5174`, `http://localhost:5175` (dev)
  - `http://127.0.0.1:5173`, `http://127.0.0.1:5174`, `http://127.0.0.1:5175` (dev)

- Allowed Methods: `GET, POST, PUT, DELETE, OPTIONS`
- Allowed Headers: `Content-Type, Authorization`
- Credentials: Enabled

### API Endpoints
**Files:** `skill-judge-ai-backend/app/api/resume.py` and `role.py`

✅ **Status:** Fixed for production
- Resume Upload: `POST /api/resume/upload` → Returns valid JSON
- Role Analysis: `POST /api/role/analyze` → Returns valid JSON
- Error Handling: All endpoints return proper HTTP status codes with JSON error messages

### Request Logging
**File:** `skill-judge-ai-backend/app/main.py`

✅ **Status:** Enabled
- Middleware logs all `/api` requests with:
  - Request path and method
  - Origin header (verifies requests from frontend)
  - Timestamp

**How to view:** Check Render backend logs in dashboard for patterns:
```
[API] Processing request from: https://skill-judge-ai-86rg.onrender.com
[API] POST /api/resume/upload
[API] POST /api/role/analyze
```

---

## Frontend Configuration ✅

### Environment Variable
**File:** `Skilljudgeaiuidesign/.env.production`

✅ **Status:** Configured
```
VITE_API_BASE_URL=https://skill-judge-ai-tm61.onrender.com
```

This must be set in Render deployment environment variables for the frontend build.

### API Client
**File:** `Skilljudgeaiuidesign/src/api/api.js`

✅ **Status:** Production-ready
- Reads `VITE_API_BASE_URL` from environment
- No hardcoded localhost URLs
- Safe JSON parsing with `response.clone()`
- Comprehensive console logging

### Vite Configuration
**File:** `Skilljudgeaiuidesign/vite.config.ts`

✅ **Status:** Updated
- Removed proxy configuration (was: `/api → http://127.0.0.1:8000`)
- Now uses full URLs from `VITE_API_BASE_URL` environment variable

---

## Render Configuration Checklist

### Backend (Web Service)

**Name:** `skill-judge-ai-tm61`

**Environment Variables:**
```
GROQ_API_KEY = <your-actual-key> ✅
```

**Build Command:**
```
pip install -r requirements.txt
```

**Start Command:**
```
uvicorn app.main:app --host 0.0.0.0 --port 8080
```

**Health Check:** `https://skill-judge-ai-tm61.onrender.com/api/health` (if endpoint exists)

### Frontend (Static Site)

**Name:** `skill-judge-ai-86rg`

**Environment Variables:**
```
VITE_API_BASE_URL = https://skill-judge-ai-tm61.onrender.com ✅
```

**Build Command:**
```
npm install && npm run build
```

**Publish Directory:**
```
dist
```

---

## Verification Steps

### Step 1: Test Backend Health
```bash
curl https://skill-judge-ai-tm61.onrender.com/docs
```
Expected: FastAPI Swagger UI loads (confirms backend is running)

### Step 2: Check CORS Headers
```bash
curl -H "Origin: https://skill-judge-ai-86rg.onrender.com" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS https://skill-judge-ai-tm61.onrender.com/api/resume/upload -v
```
Expected: Response headers include:
```
Access-Control-Allow-Origin: https://skill-judge-ai-86rg.onrender.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

### Step 3: Manual Upload Test
1. Go to https://skill-judge-ai-86rg.onrender.com
2. Upload a test resume
3. Open browser DevTools → Network tab
4. Check that:
   - Request goes to `https://skill-judge-ai-tm61.onrender.com/api/resume/upload`
   - Response status is 201 or 200
   - Response is valid JSON (not empty)
   - No CORS errors in Console

### Step 4: Check Backend Logs
1. Go to Render dashboard → Backend service
2. View logs for your uploaded request
3. Should see:
   ```
   [API] Processing request from: https://skill-judge-ai-86rg.onrender.com
   [API] POST /api/resume/upload
   Resume upload successful
   ```

### Step 5: Test Role Analysis
1. After successful upload, select a role
2. Check Network tab for:
   - Request to `https://skill-judge-ai-tm61.onrender.com/api/role/analyze`
   - Response status 200
   - Valid JSON response with `readiness_score`

---

## Troubleshooting

### Error: CORS error in frontend console
**Cause:** Frontend URL not in backend's allowed origins
**Fix:** Add to `app/main.py` `allowed_origins` list and redeploy backend

### Error: "Empty response from server (status: 200)"
**Cause:** Backend returning status 200 but invalid/empty JSON body
**Fix:** This was the original bug - already fixed. If recurring, check:
- All Pydantic models converted to dict before JSONResponse
- No response_model parameter in @app.post decorators
- Manual dict conversion in place

### Error: "Invalid JSON response"
**Cause:** Backend returning non-JSON content (HTML error page, etc.)
**Fix:** Check backend logs for actual error, verify API endpoint exists

### Error: 404 on API endpoints
**Cause:** Frontend requesting wrong URL
**Fix:** Verify `VITE_API_BASE_URL` is set in Render environment variables

### Error: timeout or very slow requests
**Cause:** Backend service spinning up or network latency
**Fix:** Render services may be on free tier - allow 30+ seconds for first request

---

## Security Checklist ✅

- [x] No API keys exposed in frontend code
- [x] CORS restricted to specific frontend URL (no `Access-Control-Allow-Origin: *`)
- [x] Only necessary HTTP methods allowed (not `*`)
- [x] Only necessary headers allowed (not `*`)
- [x] GROQ_API_KEY only in backend environment variables
- [x] All URLs use HTTPS in production
- [x] No hardcoded localhost URLs in frontend
- [x] API configuration reads from environment variables
- [x] Sensitive data (API keys) not in git history

---

## Deployment Instructions

### Option A: Automatic Deploy on Git Push (Recommended)
1. Backend automatically redeploys on push to GitHub
2. Frontend automatically redeploys on push to GitHub
3. Check Render dashboard to see deployment progress

### Option B: Manual Redeploy
1. Go to Render dashboard
2. Select backend service → Manual Deploy → Deploy latest commit
3. Select frontend service → Manual Deploy → Deploy latest commit
4. Wait for builds to complete (usually 2-5 minutes each)

### Option C: Clear Cache
If deployment seems stuck:
1. Go to Render dashboard
2. Select the service
3. Settings → Clear all data and redeploy

---

## Expected Flow

1. **User opens frontend:** Browser loads from `https://skill-judge-ai-86rg.onrender.com`
2. **API config loads:** `VITE_API_BASE_URL` set to `https://skill-judge-ai-tm61.onrender.com`
3. **User uploads resume:** Frontend sends POST to `https://skill-judge-ai-tm61.onrender.com/api/resume/upload`
4. **CORS handshake:** Backend verifies origin matches allowed list
5. **Resume processed:** Backend extracts text, computes ATS score
6. **Response sent:** Backend returns JSON with `resume_id` and `score`
7. **Frontend receives:** Safely parses JSON, navigates to ATS Score page
8. **User selects role:** Frontend sends POST to `https://skill-judge-ai-tm61.onrender.com/api/role/analyze`
9. **Role analysis:** Backend evaluates readiness, queries Groq LLM
10. **Results displayed:** Frontend shows readiness score and verdict

---

## Additional Resources

- **Render Docs:** https://render.com/docs
- **CORS Reference:** https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
- **FastAPI CORS:** https://fastapi.tiangolo.com/tutorial/cors/
- **Vite Environment Variables:** https://vitejs.dev/guide/env-and-mode.html

---

## Last Updated
- Backend: ✅ CORS configured, logging enabled
- Frontend: ✅ API config updated, environment-driven
- Git: ✅ All changes committed and pushed
