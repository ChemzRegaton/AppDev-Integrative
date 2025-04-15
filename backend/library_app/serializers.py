# library_app/serializers.py
from rest_framework import serializers
from .models import Book, Request, BorrowingRecord

class BookSerializer(serializers.ModelSerializer):
    book_id = serializers.CharField(read_only=True)
    date_added = serializers.DateField(read_only=True)
    cover_image = serializers.ImageField(max_length=None, use_url=True, allow_null=True, required=False)

    class Meta:
        model = Book
        fields = '__all__'


class RequestSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.username')
    book_detail = BookSerializer(source='book', read_only=True)

    class Meta:
        model = Request
        fields = '__all__'

class BorrowingRecordSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.username') # Display username, not user ID
    book_title = serializers.ReadOnlyField(source='book.title') # Display book title

    class Meta:
        model = BorrowingRecord
        fields = '__all__'
        read_only_fields = ['borrow_date', 'return_date', 'is_returned']
      