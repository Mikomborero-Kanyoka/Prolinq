"""
SMTP Service for Gmail email delivery
Handles low-level SMTP operations with error handling
"""
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from dotenv import load_dotenv
import logging

load_dotenv()

logger = logging.getLogger(__name__)

class SMTPService:
    """Handles direct SMTP communication with Gmail"""
    
    def __init__(self):
        self.smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
        self.smtp_port = int(os.getenv("SMTP_PORT", 587))
        self.smtp_username = os.getenv("SMTP_USERNAME")
        self.smtp_password = os.getenv("SMTP_PASSWORD")
        self.smtp_from = os.getenv("SMTP_FROM")
        self.smtp_enabled = os.getenv("SMTP_ENABLED", "false").lower() == "true"
    
    def is_enabled(self):
        """Check if SMTP is properly configured and enabled"""
        return (
            self.smtp_enabled and 
            self.smtp_username and 
            self.smtp_password and 
            self.smtp_from and
            self.smtp_host and
            self.smtp_port
        )
    
    def send_email(self, to: str, subject: str, text_content: str, html_content: str | None = None) -> dict:
        """
        Send an email via SMTP
        
        Args:
            to: Recipient email address
            subject: Email subject
            text_content: Plain text email body (ignored if html_content is provided)
            html_content: Optional HTML email body
            
        Returns:
            dict: {"success": bool, "message": str, "error": str or None}
        """
        if not self.is_enabled():
            logger.warning("⚠️  SMTP is not enabled or not properly configured")
            return {
                "success": False,
                "message": "SMTP not enabled",
                "error": "SMTP_ENABLED=false or missing credentials"
            }
        
        try:
            # Validate required fields
            if not self.smtp_username or not self.smtp_password or not self.smtp_from:
                raise ValueError("SMTP credentials not properly configured")
            
            # Create message - HTML-only if HTML content is provided, otherwise plain text
            if html_content:
                # HTML-only email to avoid raw HTML display issues
                msg = MIMEMultipart("alternative")
                msg["Subject"] = subject
                msg["From"] = self.smtp_from
                msg["To"] = to
                
                # Add plain text alternative (empty for HTML-only)
                text_part = MIMEText("", "plain", _charset="utf-8")
                msg.attach(text_part)
                
                # Add HTML part with proper content type
                html_part = MIMEText(html_content, "html", _charset="utf-8")
                msg.attach(html_part)
            else:
                # Plain text email only
                msg = MIMEText(text_content, "plain", _charset="utf-8")
                msg["Subject"] = subject
                msg["From"] = self.smtp_from
                msg["To"] = to
            
            # Connect to Gmail SMTP server
            server = smtplib.SMTP(self.smtp_host, self.smtp_port)
            server.starttls()  # Start TLS encryption
            server.login(self.smtp_username, self.smtp_password)
            
            # Send email
            server.sendmail(self.smtp_from, to, msg.as_string())
            server.quit()
            
            logger.info(f"✅ Email sent successfully to {to}")
            return {
                "success": True,
                "message": f"Email sent to {to}",
                "error": None
            }
            
        except smtplib.SMTPAuthenticationError as e:
            error_msg = f"SMTP Authentication failed: {str(e)}"
            logger.error(f"❌ {error_msg}")
            return {
                "success": False,
                "message": "Authentication error",
                "error": error_msg
            }
        
        except smtplib.SMTPException as e:
            error_msg = f"SMTP error: {str(e)}"
            logger.error(f"❌ {error_msg}")
            return {
                "success": False,
                "message": "SMTP error",
                "error": error_msg
            }
        
        except Exception as e:
            error_msg = f"Unexpected error: {str(e)}"
            logger.error(f"❌ {error_msg}")
            return {
                "success": False,
                "message": "Unexpected error",
                "error": error_msg
            }
    
    def test_connection(self) -> dict:
        """Test SMTP connection without sending an email"""
        if not self.is_enabled():
            return {
                "success": False,
                "message": "SMTP not enabled or missing credentials"
            }
        
        try:
            # Validate required fields
            if not self.smtp_username or not self.smtp_password:
                raise ValueError("SMTP credentials not properly configured")
            
            server = smtplib.SMTP(self.smtp_host, self.smtp_port)
            server.starttls()
            server.login(self.smtp_username, self.smtp_password)
            server.quit()
            
            logger.info("✅ SMTP connection test successful")
            return {
                "success": True,
                "message": "SMTP connection successful"
            }
        
        except Exception as e:
            error_msg = f"Connection test failed: {str(e)}"
            logger.error(f"❌ {error_msg}")
            return {
                "success": False,
                "message": error_msg
            }
