# Email Ads System - Complete Guide

## 📋 Overview

The Prolinq email system is designed to dynamically include **text-based advertisements** in job recommendation emails. The system is fully implemented and ready to use with real ads from the database.

## ✅ What's Working

### Dynamic Email Content
- ✅ **Personalized job recommendations** based on AI matching
- ✅ **User-specific content** (names, skills, experience)
- ✅ **Real-time job matching** from database
- ✅ **Professional HTML email design** with Prolinq branding

### Text-Based Ad Integration
- ✅ **EmailAd database model** for storing text ads
- ✅ **Random ad selection** from active ads
- ✅ **Automatic impression tracking**
- ✅ **Graceful handling** when no ads exist
- ✅ **Professional ad styling** in golden gradient section

## 🏗️ System Architecture

### Email Flow
1. `EmailService.send_daily_job_recommendations()` called
2. Queries `EmailAd` table for active ads
3. Randomly selects one ad if available
4. Passes ad to `EmailTemplate.daily_job_recommendations()`
5. Template includes ad in HTML if provided
6. Tracks ad impressions automatically

### Database Schema
```sql
CREATE TABLE email_ads (
    id INTEGER PRIMARY KEY,
    created_by_id INTEGER NOT NULL,
    title VARCHAR NOT NULL,
    ad_text TEXT NOT NULL,
    ad_link VARCHAR,
    is_active BOOLEAN DEFAULT TRUE,
    impressions INTEGER DEFAULT 0,
    created_at DATETIME,
    updated_at DATETIME
);
```

## 🎯 How Ads Appear in Emails

When ads are present, they appear between job listings and "Why These Jobs?" section:

```
🚀 Prolinq
Smarter Job Matching For Everyone

Hi [User Name]! 🔥
Great news! We found [X] perfect opportunities...

[Job Listings 1, 2, 3...]

💼 [Ad Title]
[Ad promotional text with full description]

[Learn More →]

✨ Why These Jobs?
These positions were selected because they align...

[Rest of email content...]
```

## 🛠️ How to Add Real Text Ads

### Method 1: Using the Add Script
```bash
cd backend
python add_real_email_ad.py
```

### Method 2: Direct Database Insertion
```sql
INSERT INTO email_ads 
(created_by_id, title, ad_text, ad_link, is_active, impressions, created_at, updated_at)
VALUES 
(1, 'Your Ad Title', 'Your promotional text', 'https://your-link.com', TRUE, 0, datetime('now'), datetime('now'));
```

### Method 3: Admin Dashboard (when implemented)
- Navigate to Admin Dashboard
- Find Email Ads management section
- Add new text ads with title, content, and links

## 📊 Ad Management

### Ad Status
- **Active**: Will appear in emails
- **Inactive**: Won't appear in emails

### Metrics Tracked
- **Impressions**: How many times ad was shown in emails
- **Creation date**: When ad was added
- **Last updated**: When ad was modified

### Ad Selection Logic
- Randomly selects from all active ads
- Each email gets one random ad
- No weighting or priority system (yet)

## 🧪 Testing the System

### Check Current Ads
```bash
cd backend
python check_email_ads.py
```

### Test Email Generation
```bash
cd backend
python test_real_ads_integration.py
```

### Send Test Email with Ads
Use the admin dashboard or API endpoints to send test recommendation emails.

## 📧 Email Template Features

### Professional Design
- **Prolinq branding** with blue theme colors
- **Responsive design** for mobile/desktop
- **Golden ad section** with gradient background
- **Interactive elements** with hover effects

### Content Sections
1. **Header** with Prolinq branding
2. **Personalized greeting** with user name
3. **Job recommendations** (1-5 jobs)
4. **Advertisement section** (if ads available)
5. **Why these jobs** explanation
6. **Next steps** guidance
7. **Footer** with links and info

## 🔧 Configuration

### Email Service Settings
- **include_ad parameter**: Controls whether to include ads
- **Random selection**: Picks from active ads
- **Impression tracking**: Automatic counting
- **Graceful fallback**: Works without ads

### Template Customization
- **Ad section styling**: Golden gradient background
- **Button styling**: White with brand colors
- **Typography**: Professional font stack
- **Responsive**: Mobile-optimized layout

## 🚀 Next Steps

### For Production Use
1. **Add real text ads** using any method above
2. **Test email sending** with actual SMTP
3. **Monitor ad impressions** via admin dashboard
4. **Rotate ads** for better engagement

### Advanced Features (Future)
- **Ad scheduling** (time-based ads)
- **Ad targeting** (user-specific ads)
- **A/B testing** for ad performance
- **Click tracking** for ad effectiveness

## 📞 Support

### Commands Available
- `check_email_ads.py` - View current ads
- `add_real_email_ad.py` - Add new ad interactively
- `test_real_ads_integration.py` - Test system integration

### Database Queries
```sql
-- View all ads
SELECT * FROM email_ads;

-- View only active ads
SELECT * FROM email_ads WHERE is_active = TRUE;

-- Reset impressions
UPDATE email_ads SET impressions = 0;

-- Deactivate ad
UPDATE email_ads SET is_active = FALSE WHERE id = [ad_id];
```

## ✅ Summary

The email ads system is **fully implemented and ready**. The reason you weren't seeing ads before was simply because the `email_ads` table was empty. Now that you have the tools to add real text ads, they will appear automatically in all future recommendation emails.

The system is designed to:
- ✅ Use real text ads from database
- ✅ Work gracefully with or without ads  
- ✅ Track impressions automatically
- ✅ Display ads professionally in emails
- ✅ Support easy ad management

**Ready to use!** Just add your text ads and they'll start appearing in emails immediately.
