import os
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail


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
    except Exception:
        return False


STATUS_EMAILS = {
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


def send_order_status_email(to_email: str, order_number: str, status: str) -> bool:
    info = STATUS_EMAILS.get(status)
    if not info:
        return False

    frontend_url = os.getenv("FRONTEND_URL", "https://shop-ease-final.vercel.app")
    order_link = f"{frontend_url}/order-tracking/{order_number}"

    message = Mail(
        from_email=os.getenv("SENDGRID_FROM_EMAIL", "patelhet.0507@gmail.com"),
        to_emails=to_email,
        subject=info["subject"],
        html_content=f"""
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
            <div style="text-align: center; font-size: 48px; margin: 24px 0;">{info['icon']}</div>
            <h2 style="color: #D4AF7A; text-align: center;">ShopEase</h2>
            <p style="font-size: 15px; line-height: 1.6; color: #333;">
                {info['body']}
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
    except Exception:
        return False
