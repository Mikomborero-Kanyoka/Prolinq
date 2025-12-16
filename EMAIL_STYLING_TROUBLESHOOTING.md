# 🔧 Email Styling Troubleshooting Guide

## Issue: "HTML not a styled message"

This error occurs when email clients render the plain text version instead of the HTML version of your email.

## ✅ What We've Implemented

### 1. **HTML Email Template**
- Fully styled HTML email with Prolinq theme colors
- Responsive design with mobile support
- Professional layout with job cards and ad placement

### 2. **Database Migration**
- Added `html_content` field to EmailQueue model
- Updated SMTP service to send both text and HTML versions

### 3. **Email Service Updates**
- Enhanced to generate HTML content alongside plain text
- Integrated ad placement within job recommendations

## 🛠️ Common Causes & Solutions

### **Email Client Issues**
Some email clients (especially corporate ones) may:
1. **Strip HTML** for security reasons
2. **Not support CSS** properly
3. **Have strict rendering rules**

### **Solutions to Try**

#### **Option 1: Test with Different Email Clients**
```bash
# Send test email to multiple addresses
python backend/test_styled_email.py
```

#### **Option 2: Check Email Headers**
The email should include:
```
Content-Type: multipart/alternative; boundary="..."
```

#### **Option 3: Inline Critical CSS**
Ensure the most important styles are inline:
- Colors, fonts, basic layout
- Avoid external stylesheets

#### **Option 4: Fallback Text Version**
The plain text version should be well-formatted and readable.

## 🔍 Debugging Steps

### **1. Check Raw Email Source**
```bash
# View the raw email source that was sent
# Look for Content-Type headers
# Verify HTML structure is intact
```

### **2. Test SMTP Service Directly**
```python
# Test the HTML email directly
from services.smtp_service import SMTPService

smtp = SMTPService()
result = smtp.send_email(
    to="test@example.com",
    subject="Test HTML Email",
    text_content="Plain text version",
    html_content="<html><body><h1>HTML Version</h1></body></html>"
)
print(result)
```

### **3. Verify Database Content**
```sql
-- Check if html_content is stored correctly
SELECT id, subject, html_content FROM email_queue WHERE email_type = 'daily_jobs' LIMIT 1;
```

## 🎨 Best Practices for HTML Emails

### **1. Use Tables for Layout**
```html
<table width="100%" cellpadding="0" cellspacing="0">
  <tr>
    <td style="background: #0ea5e9; color: white; padding: 20px;">
      Header Content
    </td>
  </tr>
</table>
```

### **2. Inline All Styles**
```css
/* Bad - External CSS */
<style>
  .button { background: #0ea5e9; }
</style>

/* Good - Inline CSS */
<div style="background: #0ea5e9; color: white; padding: 20px;">
  Button Content
</div>
```

### **3. Simple Structure**
- Avoid complex CSS
- Use basic HTML tags
- Test in multiple email clients

## 🚀 Quick Fix Implementation

If you're still seeing plain text, try this immediate fix:

### **Update Email Template (Simplified)**
```python
# In backend/services/email_templates.py
# Simplify the HTML structure for better compatibility
```

### **Force HTML Content-Type**
```python
# In backend/services/smtp_service.py
# Ensure MIMEMultipart('alternative') is used correctly
```

## 📧 Test Your Current Setup

### **Send Test Email Now**
```bash
cd backend
python -c "
from services.email_service import EmailService
from services.email_templates import EmailTemplates

templates = EmailTemplates()
subject, html = templates.daily_job_recommendations(
    user_name='Test User',
    jobs=[{'title': 'Test Job', 'company': 'Test Co', 'location': 'Remote', 'job_id': 1, 'link': 'test.com'}],
    ad={'title': 'Test Ad', 'text': 'Test ad content', 'link': 'test.com'}
)
print('Subject:', subject)
print('HTML Length:', len(html))
print('HTML Preview (first 200 chars):', html[:200])
"
```

### **Check Email Queue**
```bash
cd backend
python -c "
from services.advanced_throttling_queue import AdvancedThrottlingQueue
from database import get_db

queue = AdvancedThrottlingQueue()
db = next(get_db())
status = queue.get_queue_status(db)
print('Queue Status:', status)
"
```

## 🔧 If Issues Persist

### **1. Enable Debug Mode**
Add logging to see exactly what's being sent:
```python
# In backend/services/email_service.py
import logging
logging.basicConfig(level=logging.DEBUG)
```

### **2. Test with Known Good HTML**
Use this simple test template:
```html
<!DOCTYPE html>
<html>
<body>
  <div style="font-family: Arial; padding: 20px; background: #f0f9ff;">
    <h1 style="color: #0ea5e9;">Test Email</h1>
    <p style="color: #333;">This should appear styled.</p>
  </div>
</body>
</html>
```

### **3. Check Email Client Settings**
- Ensure email client allows HTML emails
- Check security settings that might block HTML

## 📞 Support

If you continue experiencing issues after trying these solutions:

1. **Check the test email** - Open `test_styled_email.html` in a browser to see how it should look
2. **Send test emails** to different email providers (Gmail, Outlook, etc.)
3. **Review email logs** in your SMTP service
4. **Check email client compatibility** with your target users

## ✅ Verification Checklist

- [ ] HTML template generates correctly
- [ ] Theme colors are applied
- [ ] Ad placement is visible
- [ ] Responsive design works
- [ ] Email sends with both text and HTML
- [ ] Test email renders properly in browser
- [ ] Test email renders properly in email clients
- [ ] Database stores HTML content correctly

---

**Next Steps:**
1. Run the test script above
2. Send a test email to yourself
3. Check how it renders in your email client
4. If still showing plain text, try the simplified template approach

The HTML email template is complete and should render properly in modern email clients. The issue is likely in email client settings or the way the email is being processed.
