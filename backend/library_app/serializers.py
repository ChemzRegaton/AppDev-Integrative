# library_app/serializers.py
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Book, Request, BorrowingRecord, BorrowRequest, Notification, Message
from auth_app.models import CustomUser 
from .models import Reply

class BookSerializer(serializers.ModelSerializer):
    book_id = serializers.CharField(read_only=True)
    date_added = serializers.DateField(read_only=True)
    cover_image = serializers.ImageField(max_length=None, use_url=True, allow_null=True, required=False)

    class Meta:
        model = Book
        fields = '__all__'

class CustomUserSerializerForBorrowRequest(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['userId', 'fullname', 'role', 'studentId', 'age', 'course', 'birthdate', 'address', 'contactNumber', 'profile_picture']


class BookInBorrowRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = Book
        fields = ['book_id', 'title', 'author', 'cover_image']

class BorrowRequestSerializer(serializers.ModelSerializer):
    requester_profile = CustomUserSerializerForBorrowRequest(read_only=True, source='user')
    book_detail = BookInBorrowRequestSerializer(read_only=True, source='book')
    book = serializers.PrimaryKeyRelatedField(queryset=Book.objects.all(), write_only=True)
    requester_profile_picture = serializers.SerializerMethodField(read_only=True) # Changed from CharField to SerializerMethodField

    class Meta:
        model = BorrowRequest
        fields = ['id', 'requester_profile', 'book_detail', 'request_date', 'status', 'book', 'user', 'requester_profile_picture'] #add 'requester_profile_picture' to the fields
        read_only_fields = ['id', 'request_date', 'status', 'requester_profile', 'book_detail', 'user', 'requester_profile_picture']

    def get_requester_profile_picture(self, obj):
        """
        Gets the URL of the user's profile picture.
        Returns None if the user has no profile picture.
        """
        if obj.user.profile_picture:
            return obj.user.profile_picture.url
        return None

class RequestSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.username')
    book_detail = BookSerializer(source='book', read_only=True)

    class Meta:
        model = Request
        fields = '__all__'  # This should include the 'book' field
        read_only_fields = ['request_date', 'borrow_date', 'return_date', 'user'] # 'user' should be read-only on create

class BorrowingRecordSerializer(serializers.ModelSerializer):
    user = serializers.CharField(source='user.username', read_only=True) # To display username instead of ID
    book_title = serializers.CharField(source='book.title', read_only=True) # To display book title
    book_id = serializers.CharField(source='book.book_id', read_only=True) # To display book_id
    due_date = serializers.DateTimeField(read_only=True) # <--- ADD THIS LINE!

    class Meta:
        model = BorrowingRecord
        fields = ['id', 'user', 'book_title', 'book_id', 'borrow_date', 'return_date', 'is_returned', 'due_date']
        
class NotificationSerializer(serializers.ModelSerializer):
    book_title = serializers.SerializerMethodField()
    # 'status' is the field name in your Notification model, based on current consolidated model
    # If you renamed it to 'notification_type' in the model, change 'status' here too.

    class Meta:
        model = Notification
        # Ensure 'book' is here, and 'status' (or 'notification_type')
        fields = ['id', 'user', 'message', 'book', 'book_title', 'status', 'created_at', 'is_read']
        read_only_fields = ['id', 'user', 'created_at']

    def get_book_title(self, obj):
        return obj.book.title if obj.book else None

class MessageSerializer(serializers.ModelSerializer):
    sender_info = serializers.PrimaryKeyRelatedField(read_only=True, source='sender.userId')
    recipient_info = serializers.PrimaryKeyRelatedField(read_only=True, source='recipient.userId')
    # If you want to display more than just ID, use nested serializers or specific fields

    class Meta:
        model = Message
        fields = ['id', 'sender', 'recipient', 'content', 'sent_at', 'sender_info', 'recipient_info']
        read_only_fields = ['id', 'sent_at', 'sender_info', 'recipient_info']
    

class ReplySerializer(serializers.ModelSerializer):
    # Use 'original_message' if you changed the field name in the Reply model
    original_message = serializers.PrimaryKeyRelatedField(queryset=Message.objects.all())
    # Assuming 'responder' is a ForeignKey to CustomUser
    responder_info = serializers.PrimaryKeyRelatedField(read_only=True, source='responder.userId')


    class Meta:
        model = Reply
        # Adjust fields to match your updated model
        fields = ['id', 'original_message', 'responder', 'responder_info', 'content', 'sent_at']
        read_only_fields = ['id', 'responder_info', 'sent_at']

