# Picture Jobs & Picture Ads - Setup & Implementation

## What Was Added

### 1. Database Models (Updated)
**File**: `backend/models.py`

**Job Model Updates**:
```python
# Picture-only job fields
is_picture_only = Column(Boolean, default=False)
picture_filename = Column(String, nullable=True)
```

**Advertisement Model Updates**:
```python
# CTA URL for external linking
cta_url = Column(String, nullable=True)

# Picture-only ad fields
is_picture_only = Column(Boolean, default=False)
picture_filename = Column(String, nullable=True)
```

### 2. Database Schemas (Updated)
**File**: `backend/schemas.py`

Updated all relevant schemas:
- `JobCreate`: Added `is_picture_only` and `picture_filename`
- `JobResponse`: Added `is_picture_only` and `picture_filename`
- `AdvertisementBase`: Added `cta_url`
- `AdvertisementCreate`: Added `is_picture_only` and `picture_filename`
- `AdvertisementUpdate`: Added `cta_url`
- `AdvertisementResponse`: Added `cta_url`, `is_picture_only`, and `picture_filename`

### 3. Backend Routes

#### Picture Jobs Endpoint
**File**: `backend/routes/jobs.py`

```
POST /api/jobs/picture
```

**Features**:
- Upload image with title and category
- Image validation (JPG, PNG, GIF, WebP)
- File size validation (max 10MB)
- Unique filename generation
- Returns JobResponse object

#### Picture Ads Endpoint
**File**: `backend/routes/advertisements.py`

```
POST /advertisements/picture
```

**Features**:
- Upload image with CTA button
- CTA text validation (max 3 words)
- CTA URL validation (must have http:// or https://)
- Image validation and size checking
- Returns AdvertisementResponse object

### 4. Database Migration
**File**: `backend/migrations/versions/010_add_picture_jobs_and_ads.py`

Adds all necessary columns to jobs and advertisements tables.

---

## Step 1: Apply Database Migration

```bash
cd backend
alembic upgrade head
```

This will add the columns to your database.

**Columns Added**:
- `jobs.is_picture_only` (Boolean, default: false)
- `jobs.picture_filename` (String, nullable)
- `advertisements.cta_url` (String, nullable)
- `advertisements.is_picture_only` (Boolean, default: false)
- `advertisements.picture_filename` (String, nullable)

---

## Step 2: Verify Static Files Configuration

Make sure your FastAPI app serves static files:

**File**: `backend/main.py`

Add these lines if not already present:

```python
from fastapi.staticfiles import StaticFiles
import os

# Mount static files for uploads
if not os.path.exists("uploads"):
    os.makedirs("uploads", exist_ok=True)

if not os.path.exists("backend/uploads"):
    os.makedirs("backend/uploads", exist_ok=True)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
app.mount("/backend/uploads", StaticFiles(directory="backend/uploads"), name="backend_uploads")
```

---

## Step 3: Test the New Endpoints

### Test Picture Job Creation

```bash
curl -X POST http://localhost:8000/api/jobs/picture \
  -F "title=Urgent Design Work" \
  -F "category=Design" \
  -F "file=@your_image.jpg" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response** (201 Created):
```json
{
  "id": 5,
  "title": "Urgent Design Work",
  "description": "",
  "category": "Design",
  "skills_required": "",
  "is_picture_only": true,
  "picture_filename": "job_picture_abc123def456.jpg",
  "creator_id": 1,
  "status": "open",
  "created_at": "2024-01-01T10:00:00",
  "category": "Design"
}
```

### Test Picture Ad Creation

```bash
curl -X POST http://localhost:8000/advertisements/picture \
  -F "cta_text=Shop Now" \
  -F "cta_url=https://example.com/shop" \
  -F "file=@your_image.jpg" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response** (201 Created):
```json
{
  "id": 3,
  "user_id": 1,
  "item_type": "Picture Ad",
  "name": "Picture Advertisement",
  "category": "Visual",
  "company_name": "My Company",
  "price": null,
  "benefit": "Promotional image advertisement",
  "cta_text": "Shop Now",
  "cta_url": "https://example.com/shop",
  "headline": "",
  "description": "",
  "offer": null,
  "image_filename": null,
  "image_url": "/uploads/ad_picture_xyz789abc.jpg",
  "is_picture_only": true,
  "picture_filename": "ad_picture_xyz789abc.jpg",
  "status": "active",
  "views": 0,
  "clicks": 0,
  "created_at": "2024-01-01T10:00:00"
}
```

---

## Step 4: Frontend Implementation Checklist

### For Picture Jobs

- [ ] Create form component with title, category, and image upload
- [ ] Add image preview before upload
- [ ] POST to `/api/jobs/picture` with FormData
- [ ] Handle success/error responses
- [ ] In job listings, check `is_picture_only` flag
- [ ] Display picture jobs with image from `/uploads/picture_filename`
- [ ] Show title overlay on image
- [ ] Display category badge
- [ ] Ensure responsive layout

### For Picture Ads

- [ ] Create form component with CTA text, CTA URL, and image upload
- [ ] Validate CTA text (max 3 words)
- [ ] Validate CTA URL format
- [ ] Add image preview
- [ ] POST to `/advertisements/picture` with FormData
- [ ] In ads display, check `is_picture_only` flag
- [ ] Show full image with CTA button overlay
- [ ] On CTA click: open `cta_url` in new tab
- [ ] Track clicks (call backend to increment counter)
- [ ] Track views (on component mount/display)
- [ ] Add analytics display (optional)

---

## File Locations

### Backend Files Modified
- `backend/models.py` - Added DB columns
- `backend/schemas.py` - Updated Pydantic models
- `backend/routes/jobs.py` - Added picture job endpoint
- `backend/routes/advertisements.py` - Added picture ad endpoint

### New Files Created
- `backend/migrations/versions/010_add_picture_jobs_and_ads.py` - Database migration
- `PICTURE_JOBS_AND_ADS_GUIDE.md` - Comprehensive feature documentation
- `PICTURE_FEATURE_SETUP.md` - This file

### Upload Directories
- `backend/uploads/` - Picture job images
- `uploads/` - Picture ad images

---

## Image Format Support

**Supported Formats**:
- JPEG (.jpg, .jpeg)
- PNG (.png)
- GIF (.gif)
- WebP (.webp)

**Constraints**:
- Maximum file size: 10 MB
- Files are validated as actual images
- Invalid files are rejected with appropriate error messages

---

## API Reference

### Picture Jobs

```
POST /api/jobs/picture
Content-Type: multipart/form-data

Parameters:
- title (string, required): Job title
- category (string, required): Job category
- file (file, required): Image file

Returns: JobResponse (201 Created)
```

### Picture Ads

```
POST /advertisements/picture
Content-Type: multipart/form-data

Parameters:
- cta_text (string, required): CTA button text (max 3 words)
- cta_url (string, required): External URL (http:// or https://)
- file (file, required): Image file

Returns: AdvertisementResponse (201 Created)
```

---

## Troubleshooting

### Migration Fails
- Ensure you have the latest Alembic version: `pip install --upgrade alembic`
- Check database connection is working
- Verify no conflicting migrations exist

### Image Upload Fails with "Invalid file type"
- Verify your file is actually JPEG, PNG, GIF, or WebP
- Check that Content-Type header is correct
- File might be corrupted

### Image Upload Fails with "File size must be less than 10MB"
- Reduce image dimensions or quality
- Use compression tools before uploading

### Uploaded Images Not Displaying
- Verify `/uploads` directory exists and is readable
- Check FastAPI static files mounting in `main.py`
- Verify image path in response matches actual file location

### Authorization Errors
- Ensure token is valid and not expired
- Check token is included in Authorization header
- Verify user has correct role (employer/client for jobs)

---

## Features Summary

✅ **Picture-Only Jobs**
- Simple one-image job postings
- Title + Category + Image only
- No description or skills required
- Appears in regular job listings

✅ **Picture Ads**
- Promotional image with CTA button
- External URL linking (e.g., to website, shop)
- Click and view tracking
- Facebook ad-like interface

✅ **Image Management**
- Automatic filename generation (prevents collisions)
- Image validation (security)
- File size limits (10 MB max)
- Supported formats: JPEG, PNG, GIF, WebP

✅ **Database Support**
- Backward compatible (new columns are nullable/optional)
- Proper migration support
- No impact on existing jobs/ads

---

## Next Steps

1. ✅ Apply database migration (`alembic upgrade head`)
2. ⏳ Create frontend components for picture jobs
3. ⏳ Create frontend components for picture ads
4. ⏳ Add image uploading UI
5. ⏳ Add image display components
6. ⏳ Add CTA button tracking for ads
7. ⏳ Add view/click analytics
8. ⏳ Test with real images
9. ⏳ Deploy to production

---

## Questions?

Refer to:
- `PICTURE_JOBS_AND_ADS_GUIDE.md` - Detailed feature documentation
- Backend routes: `backend/routes/jobs.py` and `backend/routes/advertisements.py`
- Database models: `backend/models.py`