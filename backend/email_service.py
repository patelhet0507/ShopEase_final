from datetime import datetime
import os
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

# Consolidated and expanded order status mapping
STATUS_EMAILS = {
    "placed": {
        "subject": "Order Placed Successfully – ShopEase",
        "body": "Thank you for your purchase! Your order <strong>{order_number}</strong> has been placed successfully and is awaiting confirmation.",
        "icon": "🛒",
    },
    "confirmed": {
        "subject": "Order Confirmed – ShopEase",
        "body": "Your order <strong>{order_number}</strong> has been confirmed! We're preparing your items and will notify you when they ship.",
        "icon": "✅",
    },
    "shipped": {
        "subject": "Your Order Has Shipped – ShopEase",
        "body": "Great news! Your order <strong>{order_number}</strong> is on its way. Sit tight and track your delivery in your account.",
        "icon": "🚚",
    },
    "delivered": {
        "subject": "Order Delivered – ShopEase",
        "body": "Your order <strong>{order_number}</strong> has been delivered. Hope you love it! Feel free to leave a review.",
        "icon": "📦",
    },
    "cancelled": {
        "subject": "Order Cancelled – ShopEase",
        "body": "Your order <strong>{order_number}</strong> has been cancelled. If you have any questions, please contact support.",
        "icon": "❌",
    },
}


def send_verification_email(to_email: str, token: str) -> bool:
    frontend_url = os.getenv("FRONTEND_URL", "https://shop-ease-final.vercel.app")
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
    except Exception as e:
        print(f"Verification email error: {e}")
        return False


def send_welcome_email(to_email: str) -> bool:
    frontend_url = os.getenv("FRONTEND_URL", "https://shop-ease-final.vercel.app")

    message = Mail(
        from_email=os.getenv("SENDGRID_FROM_EMAIL", "patelhet.0507@gmail.com"),
        to_emails=to_email,
        subject="Welcome to ShopEase 🎉",
        html_content=f"""
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
            <div style="text-align:center;font-size:48px;margin:24px 0;">🎉</div>

            <h2 style="color:#D4AF7A;text-align:center;">
                Welcome to ShopEase
            </h2>

            <p>
                Your email has been successfully verified and your account is now active.
            </p>

            <p>
                Start exploring products, building wishlists, and placing orders.
            </p>

            <div style="text-align:center;margin:24px 0;">
                <a href="{frontend_url}"
                   style="display:inline-block;background:#D4AF7A;color:white;
                          padding:12px 28px;border-radius:8px;
                          text-decoration:none;font-weight:bold;">
                    Start Shopping
                </a>
            </div>

            <p style="font-size:12px;color:#999;text-align:center;">
                Thanks for joining ShopEase.
            </p>
        </div>
        """,
    )

    try:
        sg = SendGridAPIClient(os.getenv("SENDGRID_API_KEY"))
        sg.send(message)
        return True
    except Exception as e:
        print(f"Welcome email error: {e}")
        return False


def send_password_reset_email(to_email: str, reset_token: str) -> bool:
    frontend_url = os.getenv("FRONTEND_URL", "https://shop-ease-final.vercel.app")
    reset_link = f"{frontend_url}/reset-password?token={reset_token}"

    message = Mail(
        from_email=os.getenv("SENDGRID_FROM_EMAIL", "patelhet.0507@gmail.com"),
        to_emails=to_email,
        subject="Reset Your ShopEase Password",
        html_content=f"""
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
            <div style="text-align:center;font-size:48px;margin:24px 0;">🔑</div>

            <h2 style="color:#D4AF7A;text-align:center;">
                Password Reset Request
            </h2>

            <p>
                We received a request to reset the password for your ShopEase account.
            </p>

            <div style="text-align:center;margin:24px 0;">
                <a href="{reset_link}"
                   style="display:inline-block;background:#D4AF7A;color:white;
                          padding:12px 28px;border-radius:8px;
                          text-decoration:none;font-weight:bold;">
                    Reset Password
                </a>
            </div>

            <p>
                If the button doesn't work, copy and paste this link:
            </p>

            <p style="word-break:break-all;">
                {reset_link}
            </p>

            <p style="font-size:12px;color:#999;">
                If you didn't request a password reset, you can safely ignore this email.
            </p>
        </div>
        """,
    )

    try:
        sg = SendGridAPIClient(os.getenv("SENDGRID_API_KEY"))
        sg.send(message)
        return True
    except Exception as e:
        print(f"Password reset email error: {e}")
        return False


def send_login_notification_email(
    to_email: str,
    ip_address: str = "Unknown",
    device: str = "Unknown Device",
) -> bool:
    frontend_url = os.getenv("FRONTEND_URL", "https://shop-ease-final.vercel.app")

    message = Mail(
        from_email=os.getenv("SENDGRID_FROM_EMAIL", "patelhet.0507@gmail.com"),
        to_emails=to_email,
        subject="New sign-in to your ShopEase account",
        html_content=f"""
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
            <div style="text-align:center;font-size:48px;margin:24px 0;">🔐</div>

            <h2 style="color:#D4AF7A;text-align:center;">ShopEase</h2>

            <p>
                A new login was detected on your account.
            </p>

            <table style="width:100%;border-collapse:collapse;margin:16px 0;">
                <tr>
                    <td style="padding: 4px 0;"><strong>Time:</strong></td>
                    <td style="padding: 4px 0;">{datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')} UTC</td>
                </tr>
                <tr>
                    <td style="padding: 4px 0;"><strong>IP:</strong></td>
                    <td style="padding: 4px 0;">{ip_address}</td>
                </tr>
                <tr>
                    <td style="padding: 4px 0;"><strong>Device:</strong></td>
                    <td style="padding: 4px 0;">{device}</td>
                </tr>
            </table>

            <p>
                If this was not you, reset your password immediately.
            </p>

            <div style="text-align:center;margin:24px 0;">
                <a href="{frontend_url}/profile"
                   style="display:inline-block;background:#D4AF7A;color:white;
                          padding:12px 28px;border-radius:8px;
                          text-decoration:none;font-weight:bold;">
                    Review Account
                </a>
            </div>
        </div>
        """,
    )

    try:
        sg = SendGridAPIClient(os.getenv("SENDGRID_API_KEY"))
        sg.send(message)
        return True
    except Exception as e:
        print(f"Login email error: {e}")
        return False


def send_order_status_email(to_email: str, order_number: str, status: str) -> bool:
    info = STATUS_EMAILS.get(status)
    if not info:
        return False

    frontend_url = os.getenv("FRONTEND_URL", "https://shop-ease-final.vercel.app")
    order_link = f"{frontend_url}/order-tracking/{order_number}"

    body_html = info["body"].format(order_number=order_number)

    message = Mail(
        from_email=os.getenv("SENDGRID_FROM_EMAIL", "patelhet.0507@gmail.com"),
        to_emails=to_email,
        subject=info["subject"],
        html_content=f"""
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
            <div style="text-align: center; font-size: 48px; margin: 24px 0;">{info['icon']}</div>
            <h2 style="color: #D4AF7A; text-align: center;">ShopEase</h2>
            <p style="font-size: 15px; line-height: 1.6; color: #333;">
                {body_html}
            </p>
            <div style="text-align: center; margin: 24px 0;">
                <a href="{order_link}"
                   style="display: inline-block; background: #D4AF7A; color: white; padding: 12px 28px;
                          border-radius: 8px; text-decoration: none; font-weight: bold;">
                    Track Order
                </a>
            </div>
            <p style="color: #999; font-size: 12px; text-align: center;">
                Need help? Reply to this email or contact support.
            </p>
        </div>
        """,
    )

    try:
        sg = SendGridAPIClient(os.getenv("SENDGRID_API_KEY"))
        sg.send(message)
        return True
    except Exception as e:
        print(f"Order status email error: {e}")
        return False