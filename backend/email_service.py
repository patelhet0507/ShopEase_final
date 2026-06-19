import os
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail


def send_verification_email(to_email: str, token: str) -> bool:
    frontend_url = os.getenv("FRONTEND_URL", "https://shop-ease-frontend-sooty.vercel.app")
    verify_link = f"{frontend_url}/verify-email?token={token}"

    message = Mail(
        from_email=os.getenv("SENDGRID_FROM_EMAIL", "patelhet.0507@gmail.com"),
        to_emails=to_email,
        subject="Verify your ShopEase account",
        html_content=f"""
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
            <h2 style="color: #a855f7;">Welcome to ShopEase!</h2>
            <p>Please verify your email address to get started.</p>
            <a href="{verify_link}"
               style="display: inline-block; background: #a855f7; color: white; padding: 12px 24px;
                      border-radius: 8px; text-decoration: none; font-weight: bold; margin: 16px 0;">
               Verify Email
            </a>
            <p style="color: #666; font-size: 13px;">Or copy this link:<br/>{verify_link}</p>
            <p style="color: #999; font-size: 12px;">If you didn't create an account, ignore this email.</p>
        </div>
        """,
    )

    try:
        sg = SendGridAPIClient(os.getenv("SENDGRID_API_KEY"))
        sg.send(message)
        return True
    except Exception:
        return False
