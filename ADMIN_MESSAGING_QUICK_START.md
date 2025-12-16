# Admin Messaging - Quick Start Guide

## 🚀 Quick Setup

### 1. Run Database Migration
```bash
cd backend
python -m alembic upgrade head
```

### 2. Required Imports (Already Added)
The following have been automatically added to your codebase:
- ✅ `AdminMessage` model in `models.py`
- ✅ Admin messaging schemas in `schemas.py`
- ✅ Admin messaging endpoints in `routes/messages.py`
- ✅ Database migration file `006_add_admin_messages_table.py`

---

## 📋 API Endpoints Summary

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| POST | `/api/messages/admin/send-individual` | Send message to one user | Admin |
| POST | `/api/messages/admin/send-bulk` | Send message to multiple users | Admin |
| GET | `/api/messages/admin/received` | Get admin messages received | User |
| GET | `/api/messages/admin/sent` | Get admin messages sent | Admin |
| PUT | `/api/messages/admin/{id}/read` | Mark message as read | User |
| GET | `/api/messages/admin/campaign/{id}/stats` | Get campaign statistics | Admin |
| GET | `/api/messages/admin/unread/count` | Get unread message count | User |

---

## 💻 Copy-Paste Examples

### Send Individual Message
```python
# Python example using requests
import requests

payload = {
    "receiver_id": 5,
    "content": "Hello {{full_name}}, special message for you!"
}

headers = {"Authorization": f"Bearer {admin_token}"}
response = requests.post(
    "http://localhost:8000/api/messages/admin/send-individual",
    json=payload,
    headers=headers
)
print(response.json())
```

### Send Bulk to All Verified Users
```python
payload = {
    "content": "Thank you {{full_name}} for being a verified member!",
    "filter_verified": True
}

headers = {"Authorization": f"Bearer {admin_token}"}
response = requests.post(
    "http://localhost:8000/api/messages/admin/send-bulk",
    json=payload,
    headers=headers
)
print(response.json())  # Returns campaign_id
```

### Send Bulk to Specific Users
```python
payload = {
    "content": "Special offer for {{username}}",
    "recipient_ids": [1, 2, 3, 4, 5]
}

headers = {"Authorization": f"Bearer {admin_token}"}
response = requests.post(
    "http://localhost:8000/api/messages/admin/send-bulk",
    json=payload,
    headers=headers
)
campaign_id = response.json()["campaign_id"]
```

### Get Campaign Stats
```python
campaign_id = "f47ac10b-58cc-4372-a567-0e02b2c3d479"
headers = {"Authorization": f"Bearer {admin_token}"}
response = requests.get(
    f"http://localhost:8000/api/messages/admin/campaign/{campaign_id}/stats",
    headers=headers
)
print(response.json())
# Output:
# {
#     "campaign_id": "...",
#     "total_sent": 100,
#     "read_count": 45,
#     "unread_count": 55,
#     "read_percentage": 45.0
# }
```

---

## 🎯 Common Use Cases

### Welcome Email for New Users
```json
POST /api/messages/admin/send-bulk
{
    "content": "Welcome to Prolinq, {{full_name}}! 🎉 Start exploring opportunities or posting jobs today.",
    "filter_verified": false
}
```

### Verification Reminder
```json
POST /api/messages/admin/send-bulk
{
    "content": "Hi {{full_name}}, please verify your profile to unlock premium features and build trust with other users.",
    "filter_verified": false
}
```

### System Maintenance Notice
```json
POST /api/messages/admin/send-bulk
{
    "content": "Important: {{full_name}}, we'll have scheduled maintenance on Jan 20 from 2-4 AM UTC.",
    "include_all": true
}
```

### Promotional Message to Talent
```json
POST /api/messages/admin/send-bulk
{
    "content": "{{full_name}}, exciting new job opportunities matching your skills are now available!",
    "filter_role": "talent"
}
```

### Feature Announcement
```json
POST /api/messages/admin/send-bulk
{
    "content": "{{username}}, we've just launched AI-powered job matching! Check it out in your dashboard.",
    "include_all": true
}
```

---

## 🔍 Template Placeholders Available

Use these in your message content:
- `{{full_name}}` → User's full name
- `{{username}}` → User's username  
- `{{email}}` → User's email address

**Example:**
```
"Hello {{full_name}} ({{username}}), we have an opportunity for you!"
```

Will become:
```
"Hello John Doe (johndoe), we have an opportunity for you!"
```

---

## 📊 Filter Options for Bulk Messages

### By User Role
```json
{
    "content": "...",
    "filter_role": "talent"  // or "employer" or "client"
}
```

### By Verification Status
```json
{
    "content": "...",
    "filter_verified": true  // only verified users
}
```

### By Specific Users
```json
{
    "content": "...",
    "recipient_ids": [1, 5, 10, 15]
}
```

### To All Users
```json
{
    "content": "...",
    "include_all": true
}
```

### Combine Filters
Not supported in same request, but you can:
1. First request: Role + Verified filter
2. Get response with campaign_id
3. Check stats separately

---

## 🛠️ Database Tables

### admin_messages table
```sql
-- Check if table exists
SELECT COUNT(*) FROM admin_messages;

-- View recent messages
SELECT * FROM admin_messages ORDER BY created_at DESC LIMIT 10;

-- Check campaign stats
SELECT 
    bulk_campaign_id,
    COUNT(*) as total,
    SUM(CASE WHEN is_read = 1 THEN 1 ELSE 0 END) as read_count
FROM admin_messages
WHERE bulk_campaign_id = 'campaign_id_here'
GROUP BY bulk_campaign_id;
```

---

## ✅ Verification Checklist

After implementing, verify:
- [ ] Migration ran successfully (`python -m alembic upgrade head`)
- [ ] `admin_messages` table exists in database
- [ ] Admin user can send individual message
- [ ] Admin user can send bulk message
- [ ] Non-admin users cannot send admin messages
- [ ] Message templates work ({{full_name}} replaced correctly)
- [ ] Campaign statistics endpoint works
- [ ] Users can mark admin messages as read
- [ ] Unread count endpoint works

---

## 🐛 Troubleshooting

### Problem: Migration fails
```bash
# Check migration status
python -m alembic current

# Downgrade if needed
python -m alembic downgrade -1

# Try upgrade again
python -m alembic upgrade head
```

### Problem: 403 Forbidden when sending admin message
- ✅ Ensure user has `is_admin = True` in database
- ✅ Check token is valid and not expired
- ✅ Use correct bearer token format

### Problem: Template placeholders not working
- ✅ Use exact placeholders: `{{full_name}}` (double braces, no spaces)
- ✅ Check user record has these fields populated
- ✅ Verify message content is being processed

### Problem: Campaign stats endpoint returns 404
- ✅ Use exact campaign_id from bulk message response
- ✅ Ensure you're the admin who sent the campaign
- ✅ Campaign must have messages in database

---

## 📝 Response Status Codes

| Code | Meaning | Common Cause |
|------|---------|-------------|
| 200 | Success | ✅ Everything worked |
| 400 | Bad Request | Invalid JSON or missing required fields |
| 401 | Unauthorized | Missing/expired authentication token |
| 403 | Forbidden | Not admin or trying to access others' messages |
| 404 | Not Found | User/message/campaign doesn't exist |
| 500 | Server Error | Database or processing error |

---

## 🔐 Authentication

All admin endpoints require Bearer token:

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -H "Content-Type: application/json" \
     -X POST http://localhost:8000/api/messages/admin/send-individual \
     -d '{"receiver_id": 5, "content": "Hello {{full_name}}"}'
```

---

## 📞 Support

For detailed documentation, see: `ADMIN_MESSAGING_FEATURE.md`

For implementation details, check the source:
- Models: `backend/models.py` (AdminMessage class)
- Routes: `backend/routes/messages.py` (admin endpoints)
- Schemas: `backend/schemas.py` (data validation)

---

**Version:** 1.0  
**Last Updated:** January 16, 2025