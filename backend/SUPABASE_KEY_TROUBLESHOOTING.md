# Supabase Service Role Key Troubleshooting

## Issue Identified
The debug script shows: `{'statusCode': 400, 'error': 'Unauthorized', 'message': 'signature verification failed'}`

This indicates that the current service role key is either:
1. **Expired** - Service role keys have expiration dates
2. **Invalid** - The key might be corrupted or incorrect
3. **Insufficient permissions** - The key might not have storage permissions

## Solution: Generate Fresh Service Role Key

### Step 1: Go to Your Supabase Dashboard
1. Navigate to https://supabase.com/dashboard
2. Select your project: `trkmvtmdphhevfuhqlzj`

### Step 2: Generate New Service Role Key
1. Go to **Settings** → **API**
2. Scroll down to **Project API keys**
3. Click **Generate new key** for the **service_role** key
4. Copy the new service role key (it will be long)

### Step 3: Update Your .env File
Replace the current `SUPABASE_SERVICE_ROLE_KEY` in your `.env` file with the new key:

```bash
# Old key (remove this line)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRya212dG1kcGhoZXZmdWhxbHpqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNzI2NzU2MSwiZXhwIjoyMDUyODQzNTYxfQ.YdJ0_Hq3KtK5vqR2qR3L5f6g7h8i9j0k1l2m3n4o5p

# New key (paste the fresh key here)
SUPABASE_SERVICE_ROLE_KEY=your_fresh_service_role_key_here
```

### Step 4: Verify Storage Bucket Exists
1. In Supabase dashboard, go to **Storage**
2. Make sure you have a bucket named `prolinq-uploads`
3. If not, create it with public access

### Step 5: Test Again
Run the debug script again:
```bash
python debug_supabase_auth.py
```

## Alternative: Check Bucket Permissions

If the key still doesn't work, check bucket permissions:

1. In Supabase dashboard → **Storage** → **Policies**
2. Make sure there are policies allowing service role access
3. Create a policy if needed:

```sql
-- Allow service role to access the bucket
CREATE POLICY "Service role can access all files" ON storage.objects
  FOR ALL USING (auth.role() = 'service_role');
```

## Expected Success Output
When working correctly, you should see:
```
✅ Client created successfully
✅ Storage client accessible
✅ Buckets listed successfully: [...]
✅ Bucket 'prolinq-uploads' accessible: [...]
✅ File uploaded successfully
✅ File deleted successfully
```

## Next Steps After Fix
Once the authentication works:
1. Update your Railway environment variables with the new key
2. Test the upload endpoints
3. Verify frontend integration

## Common Issues & Solutions

### Issue: "Bucket not found"
**Solution**: Create the bucket in Supabase dashboard first

### Issue: "Permission denied"
**Solution**: Check RLS policies in Supabase → Storage → Policies

### Issue: "File too large"
**Solution**: Increase max file size in Supabase settings

### Issue: "Invalid file type"
**Solution**: Update allowed file types in your upload logic
