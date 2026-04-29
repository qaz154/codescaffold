from fastapi import BackgroundTasks
from pydantic import BaseModel
import time


class TaskResponse(BaseModel):
    task_id: str
    status: str
    message: str


def send_email_notification(email: str, subject: str, body: str):
    """
    Background task to send email notifications.
    In production, integrate with actual email service (SendGrid, SES, etc.)
    """
    # Simulate email sending
    print(f"Sending email to {email}: {subject}")
    time.sleep(2)  # Simulate network delay
    print(f"Email sent to {email}")


def process_data_task(data_id: str):
    """
    Background task to process data asynchronously.
    """
    print(f"Processing data: {data_id}")
    # Simulate processing
    time.sleep(5)
    print(f"Data processed: {data_id}")


def cleanup_old_records(days: int = 30):
    """
    Background task to cleanup old records from database.
    """
    print(f"Cleaning up records older than {days} days")
    # In production, this would run a database cleanup query
    time.sleep(3)
    print("Cleanup completed")


async def async_process_data(data_id: str):
    """
    Async background task for CPU-intensive operations.
    """
    print(f"Starting async processing: {data_id}")
    # Simulate async work
    await asyncio.sleep(5)
    print(f"Async processing completed: {data_id}")


# Example usage in endpoint:
# @app.post("/users/{user_id}/send-welcome")
# async def send_welcome_email(user_id: str, background_tasks: BackgroundTasks):
#     background_tasks.add_task(send_email_notification, f"user_{user_id}@example.com", "Welcome!", "Welcome to our service!")
#     return {"status": "queued", "task": "send_welcome_email"}


import asyncio
