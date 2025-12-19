# Supabase Storage Integration - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Set Up Supabase Project

1. **Create Supabase Account**
   - Go to https://supabase.com
   - Sign up for a free account

2. **Create New Project**
   - Click "New Project"
   - Choose organization
   - Set project name (e.g., "prolinq-storage")
   - Set database password
   - Choose region closest to your users

3. **Get API Credentials**
   - Go to Settings > API
   - Copy **Project URL** and **service_role** key
   - You'll need these for environment variables

### Step 2: Configure Environment Variables

Add these to your `.env` file:

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**Important:** Use the `service_role` key (not `anon` key) for server-side operations.

### Step 3: Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

The `supabase` package is already included in requirements.txt.

### Step 4: Test the Integration

Run the test script to verify everything works:

```bash
python test_supabase_integration.py
```

This will test:
- ✅ Environment variables
- ✅ Supabase connection
- ✅ File path generation
- ✅ Optional upload test

### Step 5: Start the Backend

```bash
python main.py
```

The upload endpoints will be available at:
- `POST /uploads/upload-photo`
- `POST /uploads/upload-cover`
- `POST /uploads/upload-advertisement`
- `POST /uploads/upload-portfolio`

## 📱 Test Upload with Frontend

### Example Upload Function:

```javascript
async function uploadPhoto(file, userId) {
  const formData = new FormData();
  formData.append('file', file);
  if (userId) formData.append('user_id', userId);

  try {
    const response = await fetch('/uploads/upload-photo', {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    const result = await response.json();
    if (response.ok) {
      console.log('Upload successful:', result.url);
      return result.url;
    } else {
      console.error('Upload failed:', result.detail);
    }
  } catch (error) {
    console.error('Upload error:', error);
  }
}

// Usage
const fileInput = document.getElementById('photo-upload');
fileInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (file) {
    const url = await uploadPhoto(file, 'user-123');
    // Use the returned URL to update UI
  }
});
```

## 🔧 Common Use Cases

### 1. User Profile Photo Upload
```javascript
// Update user profile photo
const updateProfilePhoto = async (file) => {
  const photoUrl = await uploadPhoto(file, currentUser.id);
  
  // Update user profile in database
  await fetch('/api/users/profile', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ profile_photo_url: photoUrl })
  });
};
```

### 2. Job Posting Image
```javascript
// Upload job posting image
const uploadJobImage = async (file, jobId) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('advertisement_id', jobId);

  const response = await fetch('/uploads/upload-advertisement', {
    method: 'POST',
    body: formData,
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  return await response.json();
};
```

### 3. Portfolio Document
```javascript
// Upload portfolio file (PDF, DOC, etc.)
const uploadPortfolioFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/uploads/upload-portfolio', {
    method: 'POST',
    body: formData,
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  return await response.json();
};
```

## 🛡️ Security Notes

### Authentication Required
All upload endpoints require a valid JWT token. Make sure to include:

```javascript
headers: {
  'Authorization': `Bearer ${your_jwt_token}`
}
```

### File Type Restrictions
- **Images**: JPEG, PNG, GIF, WebP (max 10MB)
- **Portfolio**: PDF, DOC, DOCX (max 15MB)

### User Isolation
Users can only access their own files. Admin users can access all files.

## 🐛 Troubleshooting

### "Environment variables not set"
```bash
# Check your .env file
cat .env | grep SUPABASE
```

### "Supabase connection failed"
- Verify your SUPABASE_URL is correct
- Check that SUPABASE_SERVICE_ROLE_KEY is valid
- Ensure your Supabase project is active

### "Permission denied"
- Use `service_role` key (not `anon` key)
- Ensure JWT token is valid and not expired
- Check user permissions

### "File too large"
- Images: max 10MB
- Portfolio files: max 15MB
- Add client-side validation before upload

## 📊 Monitor Usage

### Supabase Dashboard
- Go to your Supabase project dashboard
- Storage section shows usage statistics
- API section shows request metrics

### Application Logs
```bash
# Check backend logs for upload errors
tail -f logs/app.log
```

## 🚀 Production Deployment

### Railway
1. Set environment variables in Railway dashboard
2. Deploy as usual - no additional configuration needed

### Environment Variables for Production
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key
```

## 💡 Pro Tips

### 1. Client-side File Validation
```javascript
const validateFile = (file) => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  
  if (file.size > maxSize) {
    alert('File too large. Max size is 10MB.');
    return false;
  }
  
  if (!allowedTypes.includes(file.type)) {
    alert('Invalid file type. Only JPEG, PNG, GIF, WebP allowed.');
    return false;
  }
  
  return true;
};
```

### 2. Progress Indicator
```javascript
const uploadWithProgress = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const xhr = new XMLHttpRequest();
  
  xhr.upload.addEventListener('progress', (e) => {
    if (e.lengthComputable) {
      const percentComplete = (e.loaded / e.total) * 100;
      console.log(`Upload progress: ${percentComplete}%`);
      // Update progress bar UI
    }
  });

  xhr.open('POST', '/uploads/upload-photo');
  xhr.setRequestHeader('Authorization', `Bearer ${token}`);
  
  xhr.onload = () => {
    if (xhr.status === 200) {
      const result = JSON.parse(xhr.responseText);
      console.log('Upload complete:', result.url);
    }
  };
  
  xhr.send(formData);
};
```

### 3. Error Handling
```javascript
const uploadWithErrorHandling = async (file) => {
  try {
    const response = await uploadPhoto(file);
    showToast('Upload successful!', 'success');
    return response;
  } catch (error) {
    console.error('Upload failed:', error);
    
    if (error.message.includes('too large')) {
      showToast('File too large. Please choose a smaller file.', 'error');
    } else if (error.message.includes('invalid type')) {
      showToast('Invalid file type. Please choose an image.', 'error');
    } else {
      showToast('Upload failed. Please try again.', 'error');
    }
  }
};
```

## 🎉 You're Ready!

Your Supabase Storage integration is now complete and ready for production use. The system provides:

✅ **Scalable cloud storage**  
✅ **Secure file uploads**  
✅ **Fast CDN delivery**  
✅ **Comprehensive error handling**  
✅ **Production-ready deployment**

For more advanced features and detailed documentation, see [SUPABASE_STORAGE_INTEGRATION_COMPLETE.md](./SUPABASE_STORAGE_INTEGRATION_COMPLETE.md).
