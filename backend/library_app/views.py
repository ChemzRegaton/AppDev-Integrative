# library_app/views.py
from rest_framework import generics, serializers, permissions, views, status
from rest_framework import views
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser, IsAuthenticated, AllowAny
from rest_framework.decorators import api_view, permission_classes
from django.db.models import Sum, Count
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.contrib.auth import get_user_model
from django.conf import settings
import logging
from rest_framework.views import APIView
from channels.layers import get_channel_layer
from rest_framework import generics
import asyncio
from django.db import transaction
import json
from .models import Book, Request, BorrowingRecord, BorrowRequest, Notification, Message
from .serializers import (
    BookSerializer,
    RequestSerializer,
    ReplySerializer,
    BorrowingRecordSerializer,
    BorrowRequestSerializer,
    NotificationSerializer,
)
from django.core.mail import send_mail

logger = logging.getLogger(__name__)


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
    queryset = BorrowRequest.objects.all()
    serializer_class = BorrowRequestSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        user = self.request.user
        
        # Use a transaction to ensure both the BorrowRequest creation
        # and the user's request_count increment are atomic.
        # This means either both succeed or both fail, preventing inconsistencies.
        with transaction.atomic():
            # 1. Save the BorrowRequest, linking it to the current user.
            borrow_request = serializer.save(user=user)

            # 2. Increment the user's request_count.
            user.request_count += 1
            user.save(update_fields=['request_count']) # Use update_fields for efficiency

            # 3. Handle the requester_profile_picture for the BorrowRequest.
            #    Access the profile_picture directly from the user object.
            borrow_request.requester_profile_picture = (
                user.profile_picture.url if user.profile_picture else None
            )
            borrow_request.save(update_fields=['requester_profile_picture']) # Save this specific field

        print(f"User {user.username} (ID: {user.id}) created a new borrow request.")
        print(f"User's request_count incremented to {user.request_count}.")

    def get_queryset(self):
        """
        Filters the queryset: admins see all requests, regular users only see their own.
        """
        user = self.request.user
        if user.is_staff: # Assuming 'is_staff' indicates an admin user
            return BorrowRequest.objects.all().order_by('-request_date') # Order by newest first
        else:
            return BorrowRequest.objects.filter(user=user).order_by('-request_date') # Order by newest first
        
class BorrowRequestCreateView(generics.CreateAPIView):
    queryset = BorrowRequest.objects.all()
    serializer_class = BorrowRequestSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class PendingBorrowRequestListView(generics.ListAPIView):
    queryset = BorrowRequest.objects.filter(status='pending').select_related('user', 'book')
    serializer_class = BorrowRequestSerializer
    permission_classes = [AllowAny]  # Use AllowAny

    def get_serializer_context(self):
        """
        Extra context provided to the serializer class.
        """
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

class AcceptRequestView(generics.UpdateAPIView):
    queryset = BorrowRequest.objects.all()
    serializer_class = BorrowRequestSerializer
    permission_classes = [permissions.AllowAny] # Or your admin permission
    lookup_field = 'pk' # Assuming you're using the primary key of BorrowRequest

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        serializer.save(status='accepted') # Update the BorrowRequest status

        borrow_request = instance # The instance is now the updated BorrowRequest
        book = borrow_request.book
        user = borrow_request.user
        logger.info(f"Requesting user: {user.username}, Book: {book.title}")

        # Decrease the available quantity of the book
        if book.available_quantity > 0:
            book.available_quantity -= 1
            book.save()
            logger.info(f"Book '{book.title}' available quantity decreased to {book.available_quantity}")
        else:
            logger.warning(f"Attempted to accept request for book '{book.title}' with zero available quantity.")
            return Response({"error": f"Book '{book.title}' is currently unavailable."}, status=status.HTTP_400_BAD_REQUEST)

        # Create a BorrowingRecord
        borrow_date = timezone.now()
        return_date = borrow_date + timezone.timedelta(days=10)
        borrowing_record = BorrowingRecord.objects.create(
            user=borrow_request.user,
            book=book,
            borrow_date=borrow_date,
            return_date=return_date
        )
        borrowing_record_serializer = BorrowingRecordSerializer(borrowing_record).data

        logger.info(f"BORROWING RECORD CREATED for user: {user.username}, book: {book.title}, return date: {return_date}")

        formatted_return_date = borrowing_record.return_date.strftime('%d-%m-%y')
        
        Notification.objects.create(
            user=borrow_request.user,
            message=f"Your request for the book '{book.title}' has been accepted. Your return date is {formatted_return_date}.",
            status='accepted'
        )
        logger.info(f"NOTIFICATION CREATED in update for user: {user.username}, book: {book.title}")

        book_serializer = BookSerializer(book) # Use the book from the borrow request
        response_data = {
            "message": f"Borrow request accepted for book '{book.title}'. Return date is {borrowing_record_serializer['return_date']}.",
            "book_detail": book_serializer.data,
            "borrowing_record": borrowing_record_serializer,
        }
        return Response(response_data)        
class NotificationDeleteView(generics.DestroyAPIView):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)


class BorrowingRecordReturnView(generics.UpdateAPIView):
    queryset = BorrowingRecord.objects.filter(is_returned=False)
    serializer_class = BorrowingRecordSerializer
    permission_classes = [IsAuthenticated, AllowAny]
    lookup_field = 'pk'

    def patch(self, request, *args, **kwargs):
        borrowing_record = self.get_object()
        user = borrowing_record.user
        book = borrowing_record.book

        if borrowing_record.is_returned:
            return Response({"message": "This book has already been returned."}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            # Correct the assignment to the actual model field name: 'return_date'
            borrowing_record.return_date = timezone.now() # <-- FIX IS HERE
            borrowing_record.is_returned = True
            # Correct the update_fields to use the actual model field name: 'return_date'
            borrowing_record.save(update_fields=['return_date', 'is_returned']) # <-- FIX IS HERE

            # Increment the book's available quantity
            book.available_quantity += 1
            book.save(update_fields=['available_quantity'])

            # Decrement the user's request_count if it's greater than 0
            if user.request_count > 0:
                user.request_count -= 1
                user.save(update_fields=['request_count'])
                print(f"User {user.username}'s request_count decremented to {user.request_count}")
            else:
                print(f"User {user.username}'s request_count was already 0, not decremented.")

        return Response({"message": "Book successfully marked as returned and counts updated."}, status=status.HTTP_200_OK)
                            
class ReturnedBorrowingRecordListView(generics.ListAPIView):
    serializer_class = BorrowingRecordSerializer
    permission_classes = [IsAdminUser]  # Adjust permissions as needed

    def get_queryset(self):
        return BorrowingRecord.objects.filter(is_returned=True).select_related('user', 'book')
                        
class BorrowingRecordListView(generics.ListAPIView):
    queryset = BorrowingRecord.objects.select_related('user', 'book').all()
    serializer_class = BorrowingRecordSerializer # <--- Use the serializer!
    permission_classes = [IsAdminUser] # Adjust permission as needed

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        # Simply return the serializer's data directly
        total_borrowed_count = BorrowingRecord.objects.filter(is_returned=False).count() # Changed to count only active borrows
        return Response({
            'totalBorrowedRecords': total_borrowed_count,
            'borrowingRecords': serializer.data, # <--- Return serializer.data directly
        })        
class UnreadNotificationCountView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        unread_count = Notification.objects.filter(user=request.user, is_read=False).count()
        return Response({'unread_count': unread_count})

@api_view(['POST'])
@permission_classes([AllowAny])  # Keep AllowAny or change to IsAdminUser
def send_return_notification(request, user_id):
    CustomUser = get_user_model()

    try:
        user = CustomUser.objects.get(id=user_id)
    except CustomUser.DoesNotExist:
        return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

    notification_message = "This is a reminder that the book(s) you borrowed are past their return date. Please return them as soon as possible to avoid any penalties."

    try:
        # Create the in-app notification
        Notification.objects.create(user=user, message=notification_message)
        logger.info(f"Notification created for user {user.username}")

        # --- Email Sending Logic ---
        subject = "Reminder: Return Your Borrowed Book(s)"
        email_message = f"""
        Dear {user.username},

        This is a reminder that the book(s) you borrowed from the library are past their return date.
        Please return them as soon as possible to avoid any potential penalties.

        Thank you for your cooperation.

        Sincerely,
        Office of the Library Management System
        """
        from_email = settings.DEFAULT_FROM_EMAIL  # Use the from_email variable
        recipient_list = [user.email]

        try:
            send_mail(subject, email_message, from_email, recipient_list)  # Use the from_email variable
            logger.info(f"Return reminder email sent to {user.email}")
            return Response({'message': f'Return notification and email sent to {user.username}.'}, status=status.HTTP_201_CREATED)
        except Exception as e:
            logger.error(f"Error sending email to {user.email}: {e}", exc_info=True)
            return Response({'message': f'Return notification sent to {user.username}, but failed to send email.', 'email_error': str(e)}, status=status.HTTP_201_CREATED)
        # Alternatively, you could return an error status if email sending is critical:
        # return Response({'error': f'Failed to send return reminder email: {e}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    except Exception as e:
        logger.error(f"Error creating notification for user {user.username}: {e}", exc_info=True)
        return Response({'error': 'Failed to create return notification and potentially send email.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
class RequestRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Request.objects.all()
    serializer_class = RequestSerializer
    permission_classes = [permissions.AllowAny]

class DeleteAllBorrowRequestsView(APIView):
    permission_classes = [IsAdminUser]

    def delete(self, request, *args, **kwargs):
        try:
            deleted_count = BorrowRequest.objects.all().delete()[0]  # Delete all BorrowRequest objects
            return Response({'message': f'{deleted_count} borrow requests deleted successfully.'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': f'Error deleting borrow requests: {e}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class TotalBookCount(generics.RetrieveAPIView):
    queryset = Book.objects.all() # You might not need this if you only want the total
    serializer_class = BookSerializer # Or a simple serializer for just the count

    def retrieve(self, request, *args, **kwargs):
        total_books = Book.get_total_books()
        return Response({'total_books': total_books})

class ReturnedBookCountView(views.APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        monthly = request.query_params.get('monthly', 'false').lower() == 'true'

        queryset = BorrowingRecord.objects.filter(is_returned=True)

        if monthly:
            now = timezone.now()
            queryset = queryset.filter(return_date__year=now.year, return_date__month=now.month)

        returned_count = queryset.count()
        return Response({'returned_books_count': returned_count})

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


class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user).order_by('-created_at')

class AdminMessageReplyView(APIView):
    def post(self, request, message_id):
        # Retrieve the original notification (acting as the message)
        try:
            notification = Notification.objects.get(id=message_id)
        except Notification.DoesNotExist:
            return Response({'error': 'Notification not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Serialize the reply message
        serializer = ReplySerializer(data=request.data)
        if serializer.is_valid():
            reply_message = serializer.validated_data['reply_message']

            # Create a new notification for the reply
            new_notification = Notification.objects.create(
                message=reply_message,  # This is the reply message
                book=None,  # Adjust based on your requirements (e.g., associated book or other info)
                status='replied',  # Adjust status as needed
                created_at=timezone.now(),  # Automatically uses current time
                user=notification.user,  # Send reply to the user who initially sent the notification
                reply_message=reply_message  # Store the reply in the Notification
            )

            # Optionally, you can mark the original notification as 'replied' or handle its status if needed
            notification.status = 'replied'
            notification.save()

            return Response({'success': 'Reply sent successfully!', 'notification_id': new_notification.id}, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def get_api_base_url(request):
    """
    Returns the API base URL from Django settings.
    """
    return Response({'api_base_url': settings.API_BASE_URL})

@api_view(['PATCH'])
@permission_classes([IsAdminUser])
def decrement_request_count(request, username):
    CustomUser = get_user_model()
    
    try:
        user = CustomUser.objects.get(username=username)
        if user.request_count > 0:
            user.request_count -= 1
            user.save()
            return Response({'message': 'Request count decremented.'}, status=200)
        return Response({'message': 'Request count already 0.'}, status=200)
    except CustomUser.DoesNotExist:
        return Response({'error': 'User not found.'}, status=404)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_active_request_count(request):
    user = request.user
    count = BorrowRequest.objects.filter(user=user, status__in=['pending', 'approved']).count()
    return Response({'active_request_count': count})

from .models import BorrowRequest

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_request_count(request):
    user = request.user
    active_requests = BorrowRequest.objects.filter(user=user, status='pending').count()
    return Response({'request_count': active_requests})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def reply_to_message(request, message_id):
    message = get_object_or_404(Message, id=message_id)

    serializer = ReplySerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(responder=request.user, message=message)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
