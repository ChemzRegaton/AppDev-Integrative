# library_app/serializers.py
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Book, Request, BorrowingRecord, BorrowRequest
from auth_app.models import CustomUser 

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
        fields = ['userId', 'fullname', 'role', 'studentId', 'age', 'course', 'birthdate', 'address', 'contactNumber']


class BookInBorrowRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = Book
        fields = ['book_id', 'title', 'author', 'cover_image']

class BorrowRequestSerializer(serializers.ModelSerializer):
    requester_profile = CustomUserSerializerForBorrowRequest(read_only=True, source='user') # Directly use 'user' as the source
    book_detail = BookInBorrowRequestSerializer(read_only=True, source='book')
    book = serializers.PrimaryKeyRelatedField(queryset=Book.objects.all(), write_only=True)

    class Meta:
        model = BorrowRequest
        fields = ['id', 'requester_profile', 'book_detail', 'request_date', 'status', 'book', 'user']
        read_only_fields = ['id', 'request_date', 'status', 'requester_profile', 'book_detail', 'user']

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