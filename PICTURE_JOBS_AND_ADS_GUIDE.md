# Picture Jobs & Picture Ads Feature Guide

## Overview

This feature adds two new capabilities to Prolinq:

1. **Picture-Only Jobs**: Employers can post jobs with just a picture and title (no description or details)
2. **Picture-Only Ads**: Users can create advertisements with just a picture and a call-to-action (CTA) button

These are designed to work like simple visual content on social media platforms (similar to Facebook ads or Instagram stories).

---

## Part 1: Picture-Only Jobs

### What are Picture-Only Jobs?

Picture-only jobs allow employers to post simple visual job postings with:
- **Title**: The job title or brief description
- **Category**: Job category for filtering
- **Picture**: A single image (JPG, PNG, GIF, or WebP)

No description, skills, or budget information required.

### How It Works

#### Backend Endpoint

**Endpoint**: `POST /api/jobs/picture`

**Parameters** (Form data):
- `title` (string, required): Job title
- `category` (string, required): Job category
- `file` (file, required): Image file (max 10MB)

**Allowed Image Formats**:
- JPEG (`.jpg`, `.jpeg`)
- PNG (`.png`)
- GIF (`.gif`)
- WebP (`.webp`)

**Response**: Returns JobResponse object with:
```json
{
  "id": 1,
  "title": "Urgent - Quick Tasks",
  "description": "",
  "category": "General",
  "skills_required": "",
  "is_picture_only": true,
  "picture_filename": "job_picture_abc123xyz.jpg",
  "creator_id": 1,
  "status": "open",
  "created_at": "2024-01-01T10:00:00",
  ...
}
```

#### Database Schema

The `jobs` table now includes:
- `is_picture_only` (Boolean): Flag indicating if it's a picture-only job
- `picture_filename` (String): Filename of the uploaded image

#### Frontend Integration (Coming Soon)

The frontend will need to:

1. **Create Picture Job Form**:
   ```jsx
   // Form fields: title, category, image upload
   // POST to /api/jobs/picture with FormData
   const formData = new FormData();
   formData.append('title', 'My Picture Job');
   formData.append('category', 'Design');
   formData.append('file', imageFile);
   
   const response = await fetch('/api/jobs/picture', {
     method: 'POST',
     body: formData,
     headers: {
       'Authorization': `Bearer ${token}`
     }
   });
   ```

2. **Display Picture Jobs**:
   - In job listings, check `is_picture_only` flag
   - If true, display `picture_filename` from `/uploads/` folder
   - Show title overlaid on the image
   - Display category badge

3. **Browse Jobs Page Update**:
   - Picture jobs should appear alongside regular jobs
   - Use different card styling for visual jobs
   - Keep title prominently visible

### Image Upload Directory

Images are saved to: `backend/uploads/job_picture_*.{ext}`

### Usage Example

```bash
curl -X POST http://localhost:8000/api/jobs/picture \
  -F "title=Check This Out!" \
  -F "category=Services" \
  -F "file=@/path/to/image.jpg" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Part 2: Picture-Only Ads

### What are Picture-Only Ads?

Picture-only ads are simple promotional images with a call-to-action button, similar to Facebook ads. They include:
- **Picture**: A single promotional image
- **CTA Text**: Button text (max 3 words, e.g., "Learn More", "Shop Now")
- **CTA URL**: External URL the button links to

### How It Works

#### Backend Endpoint

**Endpoint**: `POST /advertisements/picture`

**Parameters** (Form data):
- `cta_text` (string, required): Button text (max 3 words)
- `cta_url` (string, required): External URL (must start with http:// or https://)
- `file` (file, required): Image file (max 10MB)

**Allowed Image Formats**:
- JPEG (`.jpg`, `.jpeg`)
- PNG (`.png`)
- GIF (`.gif`)
- WebP (`.webp`)

**Response**: Returns AdvertisementResponse object with:
```json
{
  "id": 1,
  "user_id": 1,
  "item_type": "Picture Ad",
  "name": "Picture Advertisement",
  "category": "Visual",
  "company_name": "Acme Inc",
  "cta_text": "Shop Now",
  "cta_url": "https://example.com/shop",
  "is_picture_only": true,
  "picture_filename": "ad_picture_xyz789abc.jpg",
  "image_url": "/uploads/ad_picture_xyz789abc.jpg",
  "status": "active",
  "views": 0,
  "clicks": 0,
  "created_at": "2024-01-01T10:00:00",
  ...
}
```

#### Database Schema

The `advertisements` table now includes:
- `cta_url` (String): External URL for the CTA button
- `is_picture_only` (Boolean): Flag indicating if it's a picture-only ad
- `picture_filename` (String): Filename of the uploaded image

#### Frontend Integration (Coming Soon)

The frontend will need to:

1. **Create Picture Ad Form**:
   ```jsx
   // Form fields: cta_text, cta_url, image upload
   // POST to /advertisements/picture with FormData
   const formData = new FormData();
   formData.append('cta_text', 'Learn More');
   formData.append('cta_url', 'https://example.com');
   formData.append('file', imageFile);
   
   const response = await fetch('/advertisements/picture', {
     method: 'POST',
     body: formData,
     headers: {
       'Authorization': `Bearer ${token}`
     }
   });
   ```

2. **Display Picture Ads**:
   - Show image from `/uploads/` folder
   - Place CTA button overlaid on the image (bottom right or center)
   - On button click, open `cta_url` in new tab
   - Track click event (increment `clicks` counter)
   - Track view event when ad is displayed (increment `views` counter)

3. **Ad Gallery/Feed**:
   - Picture ads should display in a grid or feed layout
   - Similar to Instagram or Facebook ads
   - Include hover effects to highlight CTA button

### CTA Validation

- **CTA Text**: Maximum 3 words (e.g., "Learn More", "Shop Now", "Download Free")
- **CTA URL**: Must be valid and start with `http://` or `https://`

### Image Upload Directory

Images are saved to: `uploads/ad_picture_*.{ext}`

### Usage Example

```bash
curl -X POST http://localhost:8000/advertisements/picture \
  -F "cta_text=Shop Now" \
  -F "cta_url=https://example.com/shop" \
  -F "file=@/path/to/promo.jpg" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Database Migration

A new migration file has been created: `010_add_picture_jobs_and_ads.py`

To apply the migration:

```bash
cd backend
alembic upgrade head
```

This will add the following columns:
- `jobs.is_picture_only` (Boolean, default: False)
- `jobs.picture_filename` (String, nullable)
- `advertisements.cta_url` (String, nullable)
- `advertisements.is_picture_only` (Boolean, default: False)
- `advertisements.picture_filename` (String, nullable)

---

## Image Storage & Serving

### Storage Location
- **Picture Jobs**: `backend/uploads/job_picture_*.{ext}`
- **Picture Ads**: `uploads/ad_picture_*.{ext}`

### Serving Images

Images are served statically through FastAPI's static files middleware. Ensure the uploads directory is properly configured in your FastAPI app:

```python
from fastapi.staticfiles import StaticFiles

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
app.mount("/backend/uploads", StaticFiles(directory="backend/uploads"), name="backend_uploads")
```

### File Size Limits

- **Maximum file size**: 10 MB
- **Allowed formats**: JPEG, PNG, GIF, WebP

### Image Validation

- Files are validated as actual images (not just by extension)
- Invalid images will be rejected with an error message
- All images are checked for proper format before saving

---

## Features Included

### For Picture Jobs
✅ Upload single image
✅ Set title and category
✅ Automatically appear in job listings
✅ No description or skills required
✅ Full compatibility with existing job system
✅ Image validation and size checking
✅ Unique filename generation to prevent collisions

### For Picture Ads
✅ Upload promotional image
✅ Add CTA button with text and URL
✅ External URL linking (e.g., to website, shop, landing page)
✅ Click tracking (clicks counter)
✅ View tracking (views counter)
✅ Image validation and size checking
✅ Unique filename generation to prevent collisions

---

## Frontend Components Needed

### For Picture Jobs
1. **Create Picture Job Form Component**
   - Title input
   - Category dropdown
   - Image upload with preview
   - Submit button

2. **Picture Job Card Component**
   - Display image
   - Show title overlay
   - Show category badge
   - Indicate it's a picture-only job

3. **Jobs List Update**
   - Support mixed view (text jobs + picture jobs)
   - Responsive layout for both types

### For Picture Ads
1. **Create Picture Ad Form Component**
   - CTA text input (with word limit)
   - CTA URL input (with validation)
   - Image upload with preview
   - Submit button

2. **Picture Ad Display Component**
   - Full-width image
   - CTA button overlay (styled for prominence)
   - Click tracking
   - View tracking

3. **Ads Gallery/Feed Component**
   - Grid or feed layout
   - Load picture ads from `/advertisements` endpoint
   - Filter by `is_picture_only === true`

---

## API Endpoints Summary

### Picture Jobs

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/jobs/picture` | Create a picture-only job |
| GET | `/api/jobs/` | List all jobs (includes picture jobs) |
| GET | `/api/jobs/{id}` | Get a specific job (picture or regular) |

### Picture Ads

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/advertisements/picture` | Create a picture-only ad |
| GET | `/advertisements/` | List all ads (includes picture ads) |
| GET | `/advertisements/{id}` | Get a specific ad (picture or regular) |

---

## Error Handling

### Picture Jobs Errors
- **403 Forbidden**: Only employers/clients can post jobs
- **400 Bad Request**: Invalid file type, file too large, or corrupted image
- **401 Unauthorized**: User not authenticated

### Picture Ads Errors
- **400 Bad Request**: 
  - Invalid CTA text (>3 words)
  - Invalid CTA URL (missing protocol)
  - Invalid file type
  - File too large (>10MB)
  - Corrupted image
- **401 Unauthorized**: User not authenticated

---

## Security Considerations

1. **File Type Validation**: Only allows image formats (JPEG, PNG, GIF, WebP)
2. **File Size Limits**: Maximum 10 MB to prevent abuse
3. **Image Integrity**: Files are validated to be actual images
4. **Filename Generation**: Unique UUIDs prevent filename collisions
5. **User Authorization**: Only authenticated users can upload
6. **URL Validation**: CTA URLs must be properly formatted

---

## Future Enhancements

- [ ] Image compression and optimization
- [ ] Thumbnail generation for listings
- [ ] Drag-and-drop upload interface
- [ ] Image cropping/editing before upload
- [ ] Analytics dashboard for ads (views/clicks)
- [ ] A/B testing for ad creatives
- [ ] Scheduled posting for ads
- [ ] Bulk upload for multiple jobs/ads
- [ ] Image gallery management
- [ ] CDN integration for faster image serving

---

## Testing

### Test Picture Job Upload
```bash
# Create a test image
curl -X POST http://localhost:8000/api/jobs/picture \
  -F "title=Test Job" \
  -F "category=Design" \
  -F "file=@test_image.jpg" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test Picture Ad Upload
```bash
# Create a test ad
curl -X POST http://localhost:8000/advertisements/picture \
  -F "cta_text=Learn More" \
  -F "cta_url=https://example.com" \
  -F "file=@test_image.jpg" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Support

For issues or questions about this feature, refer to:
- Backend implementation: `backend/routes/jobs.py` and `backend/routes/advertisements.py`
- Database models: `backend/models.py`
- Schemas: `backend/schemas.py`