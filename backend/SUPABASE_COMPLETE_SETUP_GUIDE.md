# Complete Supabase Storage Setup Guide

## Overview
This guide provides everything you need to set up Supabase storage for the Prolinq application to handle all image uploads and storage needs.

## Prerequisites
- Supabase account (free tier is sufficient)
- Python environment with required packages installed
- Access to the Prolinq backend code

## Step 1: Install Supabase Python Client

First, install the Supabase Python client library:

```bash
cd Prolinq/backend
pip install supabase
```

Or add it to your requirements.txt:
```
supabase>=2.0.0
```

## Step 2: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Choose your organization
5. Enter project details:
   - **Project Name**: `prolinq-storage`
   - **Database Password**: Generate a strong password and save it
   - **Region**: Choose the closest region to your users
6. Click "Create new project"
7. Wait for the project to be set up (2-3 minutes)

## Step 3: Get Supabase Credentials

Once your project is ready:

1. Go to **Project Settings** (gear icon in left sidebar)
2. Navigate to **API** section
3. You'll need two values:
   - **Project URL** (looks like `https://xxxxxxxx.supabase.co`)
   - **Service Role Key** (starts with `eyJ...`)

## Step 4: Configure Environment Variables

Add these to your `.env` file in the backend:

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...your-service-role-key
```

**Important**: Never expose the service role key in frontend code. It should only be used on the backend.

## Step 5: Create Storage Bucket

1. In your Supabase dashboard, go to **Storage** (left sidebar)
2. Click **Create bucket**
3. Configure the bucket:
   - **Name**: `prolinq_pictures`
   - **Public bucket**: Leave unchecked (we'll use signed URLs for security)
   - **File size limit**: Keep default (50MB) or adjust as needed
4. Click **Save**

## Step 6: Set Up Row Level Security (RLS)

For security, we'll configure RLS policies:

1. In the Storage section, click on your `prolinq_pictures` bucket
2. Go to **Policies** tab
3. Click **New Policy**
4. Choose **For full customization** 
5. Create an **Insert** policy:
   ```sql
   allow inserts for authenticated users;
   ```
6. Create a **Select** policy:
   ```sql
   allow select for authenticated users;
   ```
7. Create a **Delete** policy:
   ```sql
   allow delete for authenticated users;
   ```

## Step 7: Test the Integration

Run the test script to verify everything works:

```bash
cd Prolinq/backend
python test_supabase_integration.py
```

Expected output:
```
Supabase Storage Integration Test
================================

Testing Supabase Storage Service...
✓ Supabase client initialized successfully
✓ Bucket access verified
✓ File upload test successful
✓ Signed URL generation working
✓ File deletion working

All tests passed! Supabase storage is ready to use.
```

## Step 8: Update Upload Endpoints

The upload endpoints are already configured to use Supabase. The key files:

- `services/supabase_storage.py` - Main storage service
- `routes/uploads.py` - Upload endpoints
- `main.py` - Route registration

## Step 9: Frontend Integration

The frontend is already configured to work with Supabase. The upload endpoints will:

1. Accept file uploads
2. Store them in Supabase with organized paths:
   - User photos: `photos/{user_id}/{filename}`
   - Job covers: `covers/{user_id}/{filename}`
   - Portfolio items: `portfolio/{user_id}/{filename}`
   - Ad pictures: `ads/{user_id}/{filename}`

3. Return signed URLs for secure access (valid for 1 hour)

## File Organization Structure

```
prolinq_pictures/
├── photos/
│   ├── {user_id}/
│   │   ├── {uuid}.jpg
│   │   └── {uuid}.png
├── covers/
│   ├── {user_id}/
│   │   └── {uuid}.jpg
├── portfolio/
│   ├── {user_id}/
│   │   └── {uuid}.pdf
└── ads/
    ├── {user_id}/
    │   └── {uuid}.jpg
```

## Security Features

1. **Private Storage**: Files are not publicly accessible
2. **Signed URLs**: Temporary access URLs (1 hour expiration)
3. **User Isolation**: Files organized by user ID
4. **Content Type Validation**: Only allowed file types accepted
5. **Size Limits**: Configurable file size restrictions

## Monitoring and Maintenance

### Check Storage Usage
1. Go to Supabase dashboard
2. Navigate to **Storage**
3. Click on your bucket
4. View usage statistics

### Clean Up Old Files
You can manually delete files through the dashboard or use the delete endpoint:
```python
# Example: Delete a specific file
await supabase_storage.delete_file("photos/user123/filename.jpg")
```

### Backup Strategy
Supabase automatically backs up your storage, but consider:
- Regular database backups
- Critical file backups to additional storage

## Troubleshooting

### Common Issues

1. **"Supabase storage is not available"**
   - Check environment variables are set correctly
   - Verify Supabase URL and service role key

2. **"File upload failed"**
   - Check bucket exists and is named correctly
   - Verify RLS policies are set up
   - Check file size limits

3. **"Signed URL generation failed"**
   - Ensure file exists in storage
   - Check service role key permissions

4. **CORS Issues**
   - Supabase automatically handles CORS for storage
   - If issues persist, check your Supabase project CORS settings

### Debug Mode

Enable debug logging by setting:
```bash
export PYTHONPATH=/path/to/your/backend
export LOG_LEVEL=DEBUG
```

## Production Considerations

1. **Environment Variables**: Never commit credentials to version control
2. **Service Role Key**: Keep this secret and only use on backend
3. **Monitoring**: Set up alerts for storage usage and errors
4. **Rate Limiting**: Consider implementing rate limiting for uploads
5. **Content Moderation**: Implement file content scanning if needed

## Cost Management

Supabase free tier includes:
- 1GB storage
- 2GB bandwidth per month
- 50,000 API requests per month

Monitor usage in your Supabase dashboard and upgrade if needed.

## Next Steps

Once Supabase is set up:

1. Test file uploads through the web interface
2. Verify image display works correctly
3. Test all upload workflows (user photos, job covers, portfolio, ads)
4. Monitor storage usage and performance
5. Set up automated backups if needed

## Support

If you encounter issues:

1. Check the Supabase documentation: [supabase.com/docs](https://supabase.com/docs)
2. Review the test script output for specific error messages
3. Check the backend logs for detailed error information
4. Verify all environment variables are correctly set

---

**Your Supabase storage integration is now complete!** 🎉
