# library_app/consumers.py
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import Request
from .serializers import RequestSerializer
import logging

logger = logging.getLogger(__name__)

class AdminNotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()

    async def disconnect(self, close_code):
        pass

    async def send_notification(self, event):
        notification = event['text']
        await self.send(text_data=json.dumps(notification))

@database_sync_to_async
def get_latest_requests():
    # Fetch the latest pending requests
    return Request.objects.filter(status='pending').order_by('-request_date')[:5] # Example

@database_sync_to_async
def serialize_request(request):
    serializer = RequestSerializer(request)
    return serializer.data

# Example of how you might send a notification when a new request is created (e.g., in your view or via a signal):
async def send_new_request_notification(request_instance):
    from channels.layers import get_channel_layer
    channel_layer = get_channel_layer()
    serialized_request = await serialize_request(request_instance)
    await channel_layer.group_send(
        "admin_notifications", # Define a group name
        {
            'type': 'send_notification',
            'text': {'message': 'New book request!', 'request': serialized_request},
        }
    )