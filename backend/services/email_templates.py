"""
Email templates for various email types
All templates are plain text as specified
"""
from typing import List, Dict

class EmailTemplates:
    """Collection of email templates"""
    
    @staticmethod
    def welcome_email(user_name: str) -> tuple[str, str]:
        """
        Generate welcome email for new users
        
        Returns:
            tuple: (subject, text_content)
        """
        subject = "Welcome to Prolinq!"
        
        text_content = f"""Welcome to Prolinq!

Hi {user_name},

Thanks for joining our platform! You'll now start receiving personalized job recommendations based on your skills and interests.

Here's what you can do next:

1. Complete Your Profile
   Add your skills, experience, and portfolio to get better recommendations.

2. Browse Available Jobs
   Check out opportunities that match your profile.

3. Apply to Jobs
   Submit applications to positions you're interested in.

If you need help, reply to this message anytime. Our team is always here to support you.

Best regards,
— The Prolinq Team

---
This is an automated message from Prolinq. Please don't reply with sensitive information."""

        return subject, text_content
    
    @staticmethod
    def daily_job_recommendations(
        user_name: str,
        jobs: List[Dict],
        ad: Dict | None = None
    ) -> tuple[str, str]:
        """
        Generate daily job recommendations email with HTML styling and theme colors
        
        Args:
            user_name: User's name
            jobs: List of job dicts with keys: title, company, location, job_id, link
            ad: Optional ad dict with keys: title, text, link
            
        Returns:
            tuple: (subject, html_content)
        """
        subject = f"{len(jobs)} New Job Matches for {user_name} | Prolinq"
        
        job_word = "opportunity" if len(jobs) == 1 else "opportunities"
        
        # HTML email with Prolinq theme colors
        html_content = f"""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Daily Job Recommendations</title>
    <style>
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #374151;
            background-color: #f9fafb;
        }}
        .email-container {{
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
        }}
        .header {{
            background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
            padding: 40px 30px;
            text-align: center;
            color: white;
        }}
        .logo {{
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 10px;
        }}
        .header-subtitle {{
            font-size: 16px;
            opacity: 0.9;
        }}
        .content {{
            padding: 40px 30px;
        }}
        .greeting {{
            font-size: 24px;
            font-weight: 600;
            color: #111827;
            margin-bottom: 20px;
        }}
        .intro {{
            font-size: 16px;
            color: #6b7280;
            margin-bottom: 30px;
            line-height: 1.7;
        }}
        .job-card {{
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 24px;
            margin-bottom: 20px;
            transition: all 0.2s ease;
        }}
        .job-card:hover {{
            border-color: #0ea5e9;
            box-shadow: 0 4px 12px rgba(14, 165, 233, 0.1);
        }}
        .job-number {{
            background: #0ea5e9;
            color: white;
            display: inline-block;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            text-align: center;
            line-height: 28px;
            font-weight: bold;
            font-size: 14px;
            margin-bottom: 12px;
        }}
        .job-title {{
            font-size: 18px;
            font-weight: 600;
            color: #111827;
            margin-bottom: 8px;
        }}
        .job-company {{
            font-size: 16px;
            color: #0ea5e9;
            font-weight: 500;
            margin-bottom: 6px;
        }}
        .job-location {{
            font-size: 14px;
            color: #6b7280;
            margin-bottom: 16px;
        }}
        .apply-button {{
            display: inline-block;
            background: #0ea5e9;
            color: white;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-weight: 500;
            font-size: 14px;
            transition: background-color 0.2s ease;
        }}
        .apply-button:hover {{
            background: #0284c7;
        }}
        .ad-section {{
            background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
            border-radius: 12px;
            padding: 30px;
            margin: 30px 0;
            text-align: center;
            color: white;
        }}
        .ad-title {{
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 12px;
        }}
        .ad-text {{
            font-size: 16px;
            margin-bottom: 20px;
            line-height: 1.6;
        }}
        .ad-button {{
            display: inline-block;
            background: white;
            color: #f59e0b;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 14px;
            transition: all 0.2s ease;
        }}
        .ad-button:hover {{
            background: #fef3c7;
            transform: translateY(-1px);
        }}
        .why-section {{
            background: #f0f9ff;
            border-left: 4px solid #0ea5e9;
            padding: 24px;
            margin: 30px 0;
            border-radius: 0 8px 8px 0;
        }}
        .why-title {{
            font-size: 18px;
            font-weight: 600;
            color: #111827;
            margin-bottom: 12px;
        }}
        .why-text {{
            color: #4b5563;
            line-height: 1.6;
        }}
        .next-steps {{
            background: #ecfdf5;
            border-left: 4px solid #10b981;
            padding: 24px;
            margin: 30px 0;
            border-radius: 0 8px 8px 0;
        }}
        .steps-title {{
            font-size: 18px;
            font-weight: 600;
            color: #111827;
            margin-bottom: 16px;
        }}
        .steps-list {{
            color: #4b5563;
            line-height: 1.8;
        }}
        .footer {{
            background: #111827;
            color: white;
            padding: 30px;
            text-align: center;
        }}
        .footer-text {{
            font-size: 14px;
            opacity: 0.8;
            margin-bottom: 10px;
        }}
        .footer-link {{
            color: #0ea5e9;
            text-decoration: none;
        }}
        .footer-link:hover {{
            text-decoration: underline;
        }}
        @media (max-width: 600px) {{
            .header, .content, .footer {{
                padding: 20px 15px;
            }}
            .job-card, .ad-section, .why-section, .next-steps {{
                padding: 20px;
            }}
        }}
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header -->
        <div class="header">
            <div class="logo">Prolinq</div>
            <div class="header-subtitle">Smarter Job Matching For Everyone</div>
        </div>
        
        <!-- Main Content -->
        <div class="content">
            <h1 class="greeting">Hi {user_name}!</h1>
            <p class="intro">
                Great news! We found <strong>{len(jobs)} perfect {job_word}</strong> that match your skills and experience. 
                Our AI-powered matching system has analyzed thousands of positions to bring you these personalized recommendations.
            </p>
            
            <!-- Job Listings -->
            {"".join([f"""
            <div class="job-card">
                <div class="job-number">{idx}</div>
                <div class="job-title">{job.get('title', 'Job Title')}</div>
                <div class="job-company">{job.get('company', 'Company')}</div>
                <div class="job-location">Location: {job.get('location', 'Remote')}</div>
                <a href="{job.get('link', f'https://prolinq.app/jobs/{job.get("job_id", "")}')}" class="apply-button">
                    View & Apply →
                </a>
            </div>
            """ for idx, job in enumerate(jobs, 1)])}
            
            <!-- Advertisement Section -->
            {f"""
            <div class="ad-section">
                <div class="ad-title">{ad.get('title', 'Featured Opportunity')}</div>
                <div class="ad-text">{ad.get('text', 'Discover amazing opportunities tailored for you!')}</div>
                <a href="{ad.get('link', 'https://prolinq.app')}" class="ad-button">
                    Learn More -&gt;
                </a>
            </div>
            """ if ad else ""}
            
            <!-- Why These Jobs Section -->
            <div class="why-section">
                <div class="why-title">Why These Jobs?</div>
                <div class="why-text">
                    These positions were selected because they align with your skills and experience level. 
                    Our matching algorithm considers your profile, preferences, and career goals to bring you the most relevant opportunities.
                </div>
            </div>
            
            <!-- Next Steps -->
            <div class="next-steps">
                <div class="steps-title">Next Steps:</div>
                <div class="steps-list">
                    1. Review each opportunity carefully<br>
                    2. Click to view full job details and requirements<br>
                    3. Apply if interested (takes just 30 seconds!)<br>
                    4. Our team will help guide you through the process
                </div>
            </div>
            
            <!-- Contact Info -->
            <p style="text-align: center; color: #6b7280; margin: 30px 0;">
                Questions? Feel free to reply to this email - we read every message!
            </p>
            
            <p style="text-align: center; font-weight: 600; color: #111827; margin: 20px 0;">
                Wishing you success in your job search!
            </p>
        </div>
        
        <!-- Footer -->
        <div class="footer">
            <div class="footer-text">
                — The Prolinq Matching Engine<br>
                Smarter Job Matching For Everyone
            </div>
            <div class="footer-text">
                This is an automated personalized message. Please don't reply with sensitive information.
            </div>
            <div class="footer-text">
                <a href="https://prolinq.app/settings/notifications" class="footer-link">
                    Update your preferences
                </a>
            </div>
        </div>
    </div>
</body>
</html>"""
        
        return subject, html_content
    
    @staticmethod
    def test_email(recipient_email: str) -> tuple[str, str]:
        """
        Generate test email for admin testing
        
        Returns:
            tuple: (subject, text_content)
        """
        subject = "Prolinq Email System Test"
        
        text_content = f"""Prolinq Email System Test

Hi Admin,

This is a test email from Prolinq's email system.

Recipient: {recipient_email}

If you received this message, your SMTP configuration is working correctly!

Connection Details:
- Host: smtp.gmail.com
- Port: 587 (TLS)
- Authentication: Gmail App Password

Next steps:
1. Verify this email was received
2. Check admin dashboard for queue status
3. Review email metrics

— Prolinq System

---
Test Message - Please disregard if sent in error."""
        
        return subject, text_content
    
    @staticmethod
    def format_job_for_email(job) -> Dict:
        """
        Format a job object for email display
        
        Args:
            job: SQLAlchemy Job object
            
        Returns:
            dict: Formatted job data
        """
        return {
            'title': job.title,
            'company': getattr(job.creator, 'company_name', 'Prolinq Member'),
            'location': job.location or 'Remote',
            'job_id': job.id,
            'link': f'https://prolinq.app/jobs/{job.id}'
        }
