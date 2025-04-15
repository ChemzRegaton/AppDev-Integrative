# library_app/views.py
from rest_framework import generics, serializers
from rest_framework import permissions
from .models import Book, Request
from .serializers import BookSerializer, RequestSerializer, BorrowingRecordSerializer
from django.db.models import Sum
from rest_framework import views, status
from rest_framework.response import Response
from .models import Book, BorrowingRecord

class BookListCreateView(generics.ListCreateAPIView):
    queryset = Book.objects.all()
    serializer_class = BookSerializer

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        total_books = Book.get_total_books()
        return Response({'total_books': total_books, 'books': serializer.data})

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        if response.status_code == 201:
            total_books = Book.get_total_books()
            response.data['total_books'] = total_books
        return response
    
class BookListDeleteView(views.APIView):
    def delete(self, request, *args, **kwargs):
        try:
            book_ids_to_delete = request.data.get('book_ids', [])

            if not book_ids_to_delete:
                return Response({'error': 'Please provide a list of book_ids to delete in the request body.'}, status=status.HTTP_400_BAD_REQUEST)

            deleted_count = Book.objects.filter(book_id__in=book_ids_to_delete).delete()[0]

            return Response({'message': f'{deleted_count} books deleted successfully.'}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({'error': f'Error during bulk deletion: {e}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class BookRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Book.objects.all()
    serializer_class = BookSerializer
    lookup_field = 'book_id'
    permission_classes = [permissions.AllowAny] # Keep this for testing
    allowed_methods = ['GET', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'] # Explicitly allow DELETE

    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            print(f"Attempting to delete book: {instance.title} (ID: {instance.book_id})")
            instance.delete()
            print(f"Book '{instance.title}' (ID: {instance.book_id}) deleted.")
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Book.DoesNotExist:
            return Response({'error': 'Book not found.'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            print(f"Error during manual deletion: {e}")
            return Response({'error': f'Deletion failed: {e}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    


class DeleteBookByJSONView(views.APIView):
    def delete(self, request, *args, **kwargs):
        try:
            data = request.data
            book_id_to_delete = data.get('book_id')  # Expect 'book_id' in the JSON

            if not book_id_to_delete:
                return Response({'error': 'Missing book_id in JSON body.'}, status=status.HTTP_400_BAD_REQUEST)

            try:
                book = Book.objects.get(book_id=book_id_to_delete)
                book.delete()
                return Response(status=status.HTTP_204_NO_CONTENT)
            except Book.DoesNotExist:
                return Response({'error': f'Book with id {book_id_to_delete} not found.'}, status=status.HTTP_404_NOT_FOUND)
            except Exception as e:
                return Response({'error': f'Error during deletion: {e}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        except Exception as e:
            return Response({'error': f'Invalid JSON body: {e}'}, status=status.HTTP_400_BAD_REQUEST)

class RequestListCreateView(generics.ListCreateAPIView):
    queryset = Request.objects.all()
    serializer_class = RequestSerializer
    permission_classes = [permissions.AllowAny]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class PendingRequestListView(generics.ListAPIView):
    queryset = Request.objects.filter(status='pending')
    serializer_class = RequestSerializer
    permission_classes = [permissions.AllowAny] # Or your admin permission class
    
class AcceptRequestView(generics.UpdateAPIView):
    queryset = Request.objects.all()
    serializer_class = RequestSerializer
    permission_classes = [permissions.AllowAny] # Or your admin permission

    def perform_update(self, serializer):
        serializer.save(status='approved')

class RequestRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Request.objects.all()
    serializer_class = RequestSerializer
    permission_classes = [permissions.AllowAny]

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.utils import timezone

class TotalBookCount(generics.RetrieveAPIView):
    queryset = Book.objects.all() # You might not need this if you only want the total
    serializer_class = BookSerializer # Or a simple serializer for just the count

    def retrieve(self, request, *args, **kwargs):
        total_books = Book.get_total_books()
        return Response({'total_books': total_books})

class BorrowBookView(APIView):
    permission_classes = [permissions.IsAuthenticated] # Only logged-in users can borrow

    def post(self, request, book_id):
        book = get_object_or_404(Book, book_id=book_id)
        user = request.user # Get the authenticated user
        total_borrowed_count = BorrowingRecord.objects.count()

        if book.available_quantity > 0:
            book.available_quantity -= 1
            book.save()

            # Create a new borrowing record
            borrowing_record = BorrowingRecord.objects.create(user=user, book=book)
            serializer = BorrowingRecordSerializer(borrowing_record)

            return Response({"message": f"Book '{book.title}' borrowed successfully.", "borrowing_record": serializer.data}, status=status.HTTP_201_CREATED)
        else:
            return Response({"error": f"Book '{book.title}' is currently unavailable."}, status=status.HTTP_400_BAD_REQUEST)
        



class ReturnBookView(APIView):
    permission_classes = [permissions.IsAuthenticated] # Only logged-in users can return

    def post(self, request, book_id):
        book = get_object_or_404(Book, book_id=book_id)
        user = request.user # Get the authenticated user

        # Find the active borrowing record for this user and book
        borrowing_record = BorrowingRecord.objects.filter(user=user, book=book, is_returned=False).first()
        

        if borrowing_record:
            book.available_quantity += 1
            book.save()
            borrowing_record.return_date = timezone.now()
            borrowing_record.is_returned = True
            borrowing_record.save()
            serializer = BorrowingRecordSerializer(borrowing_record)
            return Response({"message": f"Book '{book.title}' returned successfully.", "borrowing_record": serializer.data}, status=status.HTTP_200_OK)
        else:
            return Response({"error": f"No active borrowing record found for book '{book.title}' by {user.username}."}, status=status.HTTP_400_BAD_REQUEST)

# Add a view to list borrowing records (optional, for admin/user views)
class BorrowingRecordListView(generics.ListAPIView):
    queryset = BorrowingRecord.objects.all()
    serializer_class = BorrowingRecordSerializer
    permission_classes = [permissions.IsAuthenticated, permissions.AllowAny] # Adjust permissions as needed
    
    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        total_borrowed_count = BorrowingRecord.objects.count()
        return Response({
            'totalBorrowedRecords': total_borrowed_count,
            'borrowingRecords': serializer.data,
        })
        
class UserBorrowingRecordListView(generics.ListAPIView):
    serializer_class = BorrowingRecordSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return BorrowingRecord.objects.filter(user=self.request.user)
    

from django.http import HttpResponse
from channels.layers import get_channel_layer
import asyncio
import json
from .serializers import RequestSerializer
from .models import Request

async def test_admin_notification(request):
    channel_layer = get_channel_layer()
    # Create a dummy request object (or fetch one for testing)
    try:
        test_request = await Request.objects.aget(pk=1) # Replace pk=1 with an existing request ID
        serializer = RequestSerializer(test_request)
        notification_data = {
            'message': 'Test notification from backend!',
            'request': serializer.data,
        }
        await channel_layer.group_send(
            "admin_notifications",
            {
                'type': 'send_notification',
                'text': notification_data,
            }
        )
        return HttpResponse("Notification sent to admin group.")
    except Request.DoesNotExist:
        return HttpResponse("Test Request object not found.")

def test_admin_notification_sync(request):
    asyncio.run(test_admin_notification(request))
    return HttpResponse("Notification sending initiated (sync wrapper).")

