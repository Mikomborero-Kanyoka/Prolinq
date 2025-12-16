# Admin Messaging Feature Documentation

## Overview
This document describes the new admin messaging system that allows administrators to send messages to users either individually or in bulk. Admin messages are stored separately from regular user-to-user messages and include support for message templates with personalization.

## Key Features
✅ **Individual Admin Messages** - Send messages to specific users  
✅ **Bulk Messaging** - Send messages to multiple users at once  
✅ **Template Support** - Use placeholders like `{{full_name}}`, `{{username}}`, `{{email}}`  
✅ **Flexible Targeting** - Send to all users, specific IDs, or filtered by role/verification status  
✅ **Campaign Tracking** - Monitor read/unread status and engagement metrics  
✅ **Admin Badge** - Admin messages are marked with `is_bulk` and `bulk_campaign_id` fields for UI distinction  

## Database Schema

### AdminMessage Table
```sql
CREATE TABLE admin_messages (
    id INTEGER PRIMARY KEY,
    admin_id INTEGER NOT NULL (FOREIGN KEY users.id),
    receiver_id INTEGER NOT NULL (FOREIGN KEY users.id),
    content TEXT,
    is_bulk BOOLEAN DEFAULT FALSE,
    bulk_campaign_id VARCHAR,
    is_read BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT utcnow()
);
```

**Fields:**
- `id` - Unique message identifier
- `admin_id` - ID of the admin sending the message
- `receiver_id` - ID of the user receiving the message
- `content` - Message content (can contain template placeholders)
- `is_bulk` - Whether this message was part of a bulk campaign
- `bulk_campaign_id` - UUID linking messages from same bulk campaign
- `is_read` - Whether the recipient has read the message
- `created_at` - Timestamp when message was created

## API Endpoints

### 1. Send Individual Admin Message
**POST** `/api/messages/admin/send-individual`

Sends a message from an admin to a specific user.

**Requirements:** Admin authentication required

**Request Body:**
```json
{
    "receiver_id": 123,
    "content": "Hello {{full_name}}, this is an important message from the platform admin."
}
```

**Response:**
```json
{
    "id": 1,
    "admin_id": 1,
    "receiver_id": 123,
    "content": "Hello John Doe, this is an important message from the platform admin.",
    "is_bulk": false,
    "bulk_campaign_id": null,
    "is_read": false,
    "created_at": "2025-01-16T10:30:00"
}
```

**Status Codes:**
- `200` - Message sent successfully
- `404` - Receiver not found
- `403` - Unauthorized (not admin)
- `401` - Unauthenticated

---

### 2. Send Bulk Admin Messages
**POST** `/api/messages/admin/send-bulk`

Sends messages to multiple users with optional template personalization.

**Requirements:** Admin authentication required

**Request Body:**
```json
{
    "content": "Dear {{full_name}}, we have important platform updates to share with you.",
    "include_all": false,
    "recipient_ids": [1, 2, 3, 4, 5],
    "filter_role": null,
    "filter_verified": null
}
```

**Alternative Request (Send to All Verified Talent Users):**
```json
{
    "content": "Hello {{full_name}}, thank you for being a verified member of our platform!",
    "filter_role": "talent",
    "filter_verified": true
}
```

**Alternative Request (Send to All Users):**
```json
{
    "content": "Important notice for all {{username}} users.",
    "include_all": true
}
```

**Response:**
```json
{
    "campaign_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "total_sent": 5,
    "success_count": 5,
    "failed_count": 0,
    "timestamp": "2025-01-16T10:35:00"
}
```

**Request Parameters:**
- `content` (required) - Message template with optional placeholders
- `recipient_ids` (optional) - Array of specific user IDs to send to
- `filter_role` (optional) - Filter by user role ("talent", "employer", "client")
- `filter_verified` (optional) - Filter by verification status (true/false)
- `include_all` (optional) - Send to all users except admin (default: false)

**Available Template Placeholders:**
- `{{full_name}}` - User's full name
- `{{username}}` - User's username
- `{{email}}` - User's email address

**Status Codes:**
- `200` - Campaign sent successfully
- `404` - No users found matching criteria
- `403` - Unauthorized (not admin)
- `401` - Unauthenticated

---

### 3. Get Admin Messages Received
**GET** `/api/messages/admin/received`

Retrieves all admin messages received by the current user.

**Requirements:** User authentication required

**Response:**
```json
[
    {
        "id": 1,
        "admin_id": 1,
        "receiver_id": 123,
        "content": "Hello John Doe, important update.",
        "is_bulk": true,
        "bulk_campaign_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
        "is_read": true,
        "created_at": "2025-01-16T10:30:00"
    }
]
```

**Status Codes:**
- `200` - Messages retrieved successfully
- `401` - Unauthenticated

---

### 4. Get Admin Messages Sent
**GET** `/api/messages/admin/sent`

Retrieves all messages sent by the current admin user.

**Requirements:** Admin authentication required

**Response:**
```json
[
    {
        "id": 1,
        "admin_id": 1,
        "receiver_id": 123,
        "content": "Hello John Doe, important update.",
        "is_bulk": true,
        "bulk_campaign_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
        "is_read": true,
        "created_at": "2025-01-16T10:30:00"
    }
]
```

**Status Codes:**
- `200` - Messages retrieved successfully
- `403` - Unauthorized (not admin)
- `401` - Unauthenticated

---

### 5. Mark Admin Message as Read
**PUT** `/api/messages/admin/{message_id}/read`

Marks a specific admin message as read.

**Requirements:** User authentication required (can only mark own messages as read)

**Response:**
```json
{
    "message": "Message marked as read"
}
```

**Status Codes:**
- `200` - Message marked as read
- `404` - Message not found
- `403` - Unauthorized (not the recipient)
- `401` - Unauthenticated

---

### 6. Get Bulk Campaign Statistics
**GET** `/api/messages/admin/campaign/{campaign_id}/stats`

Retrieves engagement statistics for a bulk message campaign.

**Requirements:** Admin authentication required (can only view own campaigns)

**Response:**
```json
{
    "campaign_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "total_sent": 100,
    "read_count": 45,
    "unread_count": 55,
    "read_percentage": 45.0
}
```

**Status Codes:**
- `200` - Statistics retrieved successfully
- `404` - Campaign not found
- `403` - Unauthorized (not the sender)
- `401` - Unauthenticated

---

### 7. Get Unread Admin Message Count
**GET** `/api/messages/admin/unread/count`

Gets the count of unread admin messages for the current user.

**Requirements:** User authentication required

**Response:**
```json
{
    "count": 3
}
```

**Status Codes:**
- `200` - Count retrieved successfully
- `401` - Unauthenticated

---

## Usage Examples

### Example 1: Send Welcome Message to New Users
```bash
curl -X POST "http://localhost:8000/api/messages/admin/send-bulk" \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Welcome to Prolinq, {{full_name}}! We are thrilled to have you join our community. Visit your profile to get started.",
    "filter_verified": false
  }'
```

### Example 2: Send Verification Reminder to Unverified Users
```bash
curl -X POST "http://localhost:8000/api/messages/admin/send-bulk" \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Hi {{full_name}}, please complete your profile verification to unlock all features. Your verification helps build trust in our community.",
    "filter_verified": false
  }'
```

### Example 3: Send Important System Notice to All Talent
```bash
curl -X POST "http://localhost:8000/api/messages/admin/send-bulk" \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Dear {{full_name}}, we will be performing scheduled maintenance on January 20th from 2-4 AM UTC. Services may be temporarily unavailable.",
    "filter_role": "talent"
  }'
```

### Example 4: Send Individual Message
```bash
curl -X POST "http://localhost:8000/api/messages/admin/send-individual" \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "receiver_id": 123,
    "content": "Hello John, we have an exclusive opportunity for you!"
  }'
```

### Example 5: Check Campaign Engagement
```bash
curl -X GET "http://localhost:8000/api/messages/admin/campaign/f47ac10b-58cc-4372-a567-0e02b2c3d479/stats" \
  -H "Authorization: Bearer <admin_token>"
```

## Frontend Integration

### Display Admin Message with Badge
```javascript
// In your UI component
function AdminMessageItem({ message }) {
  return (
    <div className="message-container">
      {message.is_bulk && (
        <span className="badge badge-admin">Admin</span>
      )}
      <div className="message-content">
        {message.content}
      </div>
      <div className="message-meta">
        <small>{new Date(message.created_at).toLocaleDateString()}</small>
        {!message.is_read && <span className="badge badge-unread">Unread</span>}
      </div>
    </div>
  );
}
```

### Mark Message as Read
```javascript
async function markAdminMessageAsRead(messageId) {
  const response = await fetch(`/api/messages/admin/${messageId}/read`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response.json();
}
```

### Retrieve Unread Admin Messages Count
```javascript
async function getAdminUnreadCount() {
  const response = await fetch('/api/messages/admin/unread/count', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const data = await response.json();
  return data.count;
}
```

## Implementation Checklist

- [x] Database model created (`AdminMessage`)
- [x] API endpoints implemented
- [x] Template placeholder support
- [x] Bulk message targeting options
- [x] Campaign statistics tracking
- [x] Read/unread status tracking
- [x] Migration file created
- [ ] Frontend UI components
- [ ] Admin dashboard for managing campaigns
- [ ] Message scheduling (future enhancement)
- [ ] Email notifications for admin messages (future enhancement)
- [ ] Message delivery analytics (future enhancement)

## Migration Instructions

To add the admin messaging feature to your database:

```bash
cd backend
python -m alembic upgrade head
```

Or if using the migration script directly:

```bash
cd backend
python -c "from database import engine, Base; Base.metadata.create_all(bind=engine)"
```

## Security Considerations

✅ Admin-only endpoints require `get_admin_user` dependency  
✅ Only message recipients can mark messages as read  
✅ Admins can only view statistics for their own campaigns  
✅ Template placeholders are safely replaced - no code injection risk  
✅ Receiver validation prevents sending to non-existent users  

## Performance Optimization Tips

1. **Bulk Operations**: For sending to 1000+ users, consider:
   - Implementing batch processing
   - Using database bulk insert instead of ORM
   - Adding background job queue (Celery/Redis)

2. **Query Optimization**: Add database indexes on:
   - `admin_id`
   - `receiver_id`
   - `bulk_campaign_id`
   - `is_read`

3. **Frontend Caching**:
   - Cache unread message count
   - Implement infinite scroll for message lists
   - Lazy load message content

## Future Enhancements

- Message scheduling (send at specific time)
- Email notifications for admin messages
- Rich text/HTML message support
- Message attachments
- Automatic read receipts with timestamps per recipient
- Message templates library
- A/B testing for bulk campaigns
- Recipient segmentation UI in admin dashboard

---

**Last Updated:** January 16, 2025  
**Version:** 1.0  
**Author:** Zencoder AI