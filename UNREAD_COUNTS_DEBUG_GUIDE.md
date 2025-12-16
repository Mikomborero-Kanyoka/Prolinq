# 🔍 Unread Count Debugging Guide

## 📊 System Overview

The unread count system has **THREE independent data sources**:

1. **Notifications** (via `/api/notifications/unread/count`)
   - Stores system notifications
   - Table: `notifications`
   - Badge shown on Bell icon 🔔

2. **Regular Messages** (via `/api/messages/unread/count`)
   - User-to-user messages
   - Table: `messages`
   - Part of 💬 badge

3. **Admin Messages** (via `/api/messages/admin/unread/count`)
   - Admin system messages
   - Table: `admin_messages`
   - Part of 💬 badge

**Frontend shows:**
- 🔔 Bell badge = Notification count only
- 💬 Message badge = Regular messages + Admin messages combined

---

## 🚀 Quick Test Steps

### Step 1: Check Backend Socket.IO Logs

After login, you should see in **backend console**:

```
🔌 Client connected: [socket-id]
✅ User [user-id] joined room user_[user-id]
```

### Step 2: Open Frontend DevTools

Press **F12** and go to **Console** tab. Look for:

```
✅ [SocketContext] Socket CONNECTED with id: ...
```

### Step 3: Check Frontend Console Logs

After page load, you should see **[Navbar]** logs:

```
🔄 [Navbar] Fetching unread counts at [time]
📢 [Navbar] Fetching /notifications/unread/count...
📢 [Navbar] Response: {count: X}
💬 [Navbar] Fetching /messages/unread/count...
💬 [Navbar] Response: {count: X}
👑 [Navbar] Fetching /messages/admin/unread/count...
✅ [Navbar] FINAL COUNTS - notifications: X messages (incl admin): X
✅ [Navbar] Setting state: unreadCount = X, unreadMessageCount = X
```

### Step 4: Test Real-Time Updates

**Send a test message:**

1. Open browser with 2 tabs (users A and B logged in as different accounts)
2. In tab A, send message to user B
3. **Watch backend console** for:
   ```
   📡 Broadcasting message via Socket.IO to receiver: {...}
   Target room: user_[B's-user-id]
   ✅ Message broadcast successful!
   ```
4. **Watch tab B's frontend console** for:
   ```
   📡 [SocketContext] Socket event received: "new_message" [...]
   📨 [SocketContext] ✅ RECEIVED NEW_MESSAGE event: {...}
   📨 [SocketContext] Dispatching custom event to window...
   🔄 [Navbar] Fetching unread counts...
   ```
5. The 💬 badge on tab B should update within 30 seconds

---

## 🐛 Troubleshooting

### Problem: Badges don't show even though counts are fetched

**Check:**
```javascript
// In DevTools console, check if state is updating:
console.log(document.querySelector('[class*="badge"]')?.textContent)
```

**Solution:** Check that Navbar component is re-rendering:
```
✅ [Navbar] Setting state: unreadCount = X, unreadMessageCount = X
```

### Problem: Socket.IO Events Not Received

**Check in DevTools console:**
- Do you see `✅ [SocketContext] Socket CONNECTED` ?
- Do you see `✅ [SocketContext] RECEIVED...event` logs?

**If not:**
1. Check backend is running on port 8001
2. Check CORS settings in backend/main.py (should include http://localhost:5173)
3. Restart frontend and backend

### Problem: API Endpoints Returning Errors

**Frontend will show:**
```
📢 [Navbar] ❌ Error fetching notification count: {
  message: "...",
  status: 401,
  data: {...}
}
```

**If status is 401:** Token has expired
- Solution: Logout and login again

**If status is 404:** Endpoint not found
- Solution: Check backend routes are properly included

---

## 🔧 Manual Testing Commands

### Test Backend Endpoints

```bash
# Get unread notification count
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:8001/api/notifications/unread/count

# Get unread message count
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:8001/api/messages/unread/count

# Get unread admin message count
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:8001/api/messages/admin/unread/count

# Create a test notification (replace USER_ID with actual ID)
curl -X POST http://localhost:8001/api/notifications \
  -H "Content-Type: application/json" \
  -d '{"user_id": USER_ID, "title": "Test", "message": "Test notification"}'
```

### Test Socket.IO Events

**In backend Python console:**
```python
# From main.py or any route that has access to sio:
await sio.emit('notification', {
    'id': 1,
    'user_id': 1,
    'title': 'Test',
    'message': 'Real-time test notification',
    'type': 'general'
}, room='user_1')
```

---

## 📈 Event Flow

```
1. User logs in
   ↓
2. Frontend connects Socket.IO (with user_id in auth)
   ↓
3. Backend: connect handler joins user to room "user_X"
   ↓
4. Frontend: Navbar fetches unread counts
   ↓
5. Frontend: Sets up 30-second polling interval
   ↓
6. When message is sent:
   ↓
7. Backend: emits 'new_message' to room user_Y
   ↓
8. Frontend receives 'new_message' event
   ↓
9. Frontend: Navbar.fetchUnreadCounts() is called
   ↓
10. Badges update
```

---

## 🎯 Key Files to Monitor

**Backend:**
- `backend/main.py` - Socket.IO connection handler
- `backend/routes/messages.py` - Message broadcasting (lines 48-80)
- `backend/routes/notifications.py` - Notification broadcasting (lines 57-87)

**Frontend:**
- `frontend/src/contexts/SocketContext.jsx` - Socket.IO event listeners
- `frontend/src/components/Navbar.jsx` - Unread count fetching & display

---

## 📋 Debugging Checklist

- [ ] Backend running on port 8001
- [ ] Frontend running on port 5173
- [ ] CORS enabled for localhost:5173 in backend
- [ ] User is authenticated (token is valid)
- [ ] Socket.IO connection shows in DevTools
- [ ] Console shows `✅ User X joined room user_X`
- [ ] Navbar fetches counts (check console logs)
- [ ] Counts are > 0 and state is being set
- [ ] Badges are rendering in navbar
- [ ] Real-time events are being received and dispatched

---

## 💡 Pro Tips

1. **Enable persistence logs in DevTools:**
   - Right-click Console → Settings → "Preserve log on navigation"
   - This keeps logs visible when navigating

2. **Filter logs by prefix:**
   - In DevTools console filter box, search: `[Navbar]` or `[SocketContext]`

3. **Monitor network requests:**
   - Open DevTools → Network tab
   - Filter by `unread/count`
   - Should see 200 OK responses

4. **Check database directly:**
   ```bash
   sqlite3 backend/prolinq.db
   SELECT COUNT(*) FROM notifications WHERE user_id = 1 AND is_read = 0;
   SELECT COUNT(*) FROM messages WHERE receiver_id = 1 AND is_read = 0;
   SELECT COUNT(*) FROM admin_messages WHERE receiver_id = 1 AND is_read = 0;
   ```

---

## 🆘 Still Not Working?

1. **Restart everything:**
   ```bash
   # Terminal 1: Backend
   cd backend
   python -m venv venv
   .\venv\Scripts\activate
   python main.py
   
   # Terminal 2: Frontend
   cd frontend
   npm run dev
   ```

2. **Check browser console for the PREFIX:**
   - `[Navbar]` logs = Frontend unread count fetching
   - `[SocketContext]` logs = Socket.IO events
   - No prefix = other system logs

3. **Share the full console output:**
   - Open DevTools → Right-click console area → Save as...
   - Share the log file for analysis