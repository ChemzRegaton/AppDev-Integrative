# library_app/urls.py
from django.urls import path
from . import views
from .views import (
    TotalBookCount,
    BookRetrieveUpdateDestroyView,
    DeleteBookByJSONView,
    BookListDeleteView,
    RequestListCreateView,
    BorrowBookView,
    BorrowingRecordListView,
    UserBorrowingRecordListView,
    PendingBorrowRequestListView,  # Corrected import name
    AcceptRequestView,
    BookListCreateView,
    DeleteAllBorrowRequestsView,
    NotificationListView,
    NotificationDeleteView,
    UnreadNotificationCountView,
    BorrowingRecordReturnView,
    ReturnedBookCountView,
    ReturnedBorrowingRecordListView,
    
)

urlpatterns = [
    # Books
    path('books/', BookListCreateView.as_view(), name='book-list-create'),
    path('books/delete', BookListDeleteView.as_view(), name='book-list-delete'),
    path('books/<str:book_id>/', BookRetrieveUpdateDestroyView.as_view(), name='book-retrieve-update-destroy'),
    path('books/', TotalBookCount.as_view(), name='total_book_count'),
    path('books/<str:book_id>/borrow/', BorrowBookView.as_view(), name='borrow-book'),

    # Borrowing Records
    path('borrowing-records/', BorrowingRecordListView.as_view(), name='borrowing-record-list'),  # For admin
    path('my-borrowing-records/', UserBorrowingRecordListView.as_view(), name='user-borrowing-record-list'),  # For users
    path('borrowing-records/<int:pk>/return/', views.BorrowingRecordReturnView.as_view(), name='borrowing_record_return'),
    path('returned-books/count/', views.ReturnedBookCountView.as_view(), name='returned_books_count'),
    path('borrowing-records/returned/', ReturnedBorrowingRecordListView.as_view(), name='returned-borrowing-record-list'),
    

    # Requests (General)
    path('requests/', views.RequestListCreateView.as_view(), name='request-list-create'),  # For users to create
    path('requests/<int:pk>/accept/', views.AcceptRequestView.as_view(), name='accept-request'),  # Use pk for request ID
    path('notifications/', NotificationListView.as_view()),
    path('notifications/<int:pk>/', NotificationDeleteView.as_view(), name='notification-delete'),
    path('notifications/unread/count/', UnreadNotificationCountView.as_view(), name='unread-notification-count'),
    path('notifications/send-return/<int:user_id>/', views.send_return_notification, name='send_return_notification'),

    # Admin Specific Requests
    path('borrow-requests/', views.BorrowRequestCreateView.as_view(), name='borrow-request-create'),
    path('admin/requests/pending/', PendingBorrowRequestListView.as_view(), name='admin-pending-requests'),
    path('admin/requests/delete_all/', DeleteAllBorrowRequestsView.as_view(), name='admin-delete-all-requests'),# Corrected view name
    # Remove the duplicate line
    # path('admin/requests/pending/', PendingBorrowRequestListView.as_view(), name='pending-borrow-requests'),

    # Testing
    path('test-admin-notification/', views.test_admin_notification_sync, name='test-admin-notification'),

    # Deletion via JSON
    path('books/delete_json/', DeleteBookByJSONView.as_view(), name='delete-book-json'),
    
    
]