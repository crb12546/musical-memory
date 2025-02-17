from typing import Dict, Any, Optional
from datetime import datetime
from enum import Enum

class NotificationType(str, Enum):
    INTERVIEW_SCHEDULED = "interview_scheduled"
    RESUME_RECEIVED = "resume_received"
    FEEDBACK_SUBMITTED = "feedback_submitted"
    OFFER_SENT = "offer_sent"
    ONBOARDING_STARTED = "onboarding_started"

class NotificationService:
    def __init__(self):
        self.templates = {
            NotificationType.INTERVIEW_SCHEDULED: "面试已安排：{candidate_name} - {datetime}",
            NotificationType.RESUME_RECEIVED: "收到新简历：{candidate_name}",
            NotificationType.FEEDBACK_SUBMITTED: "面试反馈已提交：{candidate_name}",
            NotificationType.OFFER_SENT: "Offer已发送：{candidate_name}",
            NotificationType.ONBOARDING_STARTED: "入职流程已开始：{candidate_name}"
        }
    
    async def format_message(self, event_type: NotificationType, data: Dict[str, Any]) -> str:
        """Format notification message using template."""
        template = self.templates.get(event_type)
        if not template:
            raise ValueError(f"Unknown notification type: {event_type}")
        
        try:
            # Format datetime if present
            if "datetime" in data:
                dt = datetime.fromisoformat(data["datetime"])
                data["datetime"] = dt.strftime("%Y-%m-%d %H:%M")
            
            return template.format(**data)
        except KeyError as e:
            raise ValueError(f"Missing required data field: {e}")
        except Exception as e:
            raise ValueError(f"Failed to format message: {str(e)}")
    
    async def send_notification(
        self,
        event_type: NotificationType,
        data: Dict[str, Any],
        recipient_id: Optional[str] = None
    ) -> None:
        """
        Send a notification to the specified recipient.
        
        Args:
            event_type: Type of notification event
            data: Data to populate the notification template
            recipient_id: Optional recipient ID. If None, notification is broadcast to all relevant users.
        """
        try:
            message = await self.format_message(event_type, data)
            
            # TODO: Implement actual notification sending logic
            # This could be:
            # 1. WebSocket for real-time notifications
            # 2. Email notifications
            # 3. SMS notifications
            # 4. Integration with messaging platforms
            
            print(f"Notification sent: {message} to recipient: {recipient_id or 'all'}")
            
        except Exception as e:
            print(f"Failed to send notification: {str(e)}")
            raise

notification_service = NotificationService()
