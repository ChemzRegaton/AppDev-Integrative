# library_app/serializers.py
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Book, Request, BorrowingRecord, BorrowRequest, Notification
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
    user = serializers.ReadOnlyField(source='user.username') # Display username, not user ID
    book_title = serializers.ReadOnlyField(source='book.title') # Display book title

    class Meta:
        model = BorrowingRecord
        fields = '__all__'
        read_only_fields = ['borrow_date', 'return_date', 'is_returned']

class NotificationSerializer(serializers.ModelSerializer):
    book_title = serializers.SerializerMethodField()
    reply_message = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = Notification
        fields = ['id', 'message', 'book', 'book_title', 'status', 'created_at', 'reply_message']
        read_only_fields = ['id', 'created_at']

    def get_book_title(self, obj):
        return obj.book.title if obj.book else None


class AdminReplyInputSerializer(serializers.Serializer):
    """
    A serializer to validate the content of an admin's reply.
    """
    content = serializers.CharField(max_length=1000) # Ensure you have a max_length suitable for replies

class ReplySerializer(serializers.ModelSerializer):
    class Meta:
        model = Reply
        fields = ['id', 'message', 'responder', 'content', 'created_at']
        read_only_fields = ['id', 'responder', 'created_at']


