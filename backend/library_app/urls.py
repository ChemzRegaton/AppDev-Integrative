# library_app/urls.py
from django.urls import path
from .views import (
    BookListCreateView,
    BookListDeleteView,
    BookRetrieveUpdateDestroyView,
    TotalBookCount,
    BorrowBookView,
    BorrowingRecordListView,
    UserBorrowingRecordListView,
    BorrowingRecordReturnView,
    ReturnedBookCountView,
    ReturnedBorrowingRecordListView,
    RequestListCreateView,
    AcceptRequestView,
    NotificationListView,
    NotificationDeleteView,
    UnreadNotificationCountView,
    send_return_notification,
    BorrowRequestCreateView,
    PendingBorrowRequestListView,
    DeleteAllBorrowRequestsView,
    reply_to_message,
    get_user_request_count,
    reset_user_request_count
    # ← import your new function view
)

urlpatterns = [
    # Books
    path('books/', BookListCreateView.as_view(), name='book-list-create'),
    path('books/delete', BookListDeleteView.as_view(), name='book-list-delete'),
    path('books/<str:book_id>/', BookRetrieveUpdateDestroyView.as_view(), name='book-retrieve-update-destroy'),
    path('books/count/', TotalBookCount.as_view(), name='total_book_count'),
    path('books/<str:book_id>/borrow/', BorrowBookView.as_view(), name='borrow-book'),

    # Borrowing Records
    path('borrowing-records/', BorrowingRecordListView.as_view(), name='borrowing-record-list'),
    path('my-borrowing-records/', UserBorrowingRecordListView.as_view(), name='user-borrowing-record-list'),
    path('borrowing-records/<int:pk>/return/', BorrowingRecordReturnView.as_view(), name='borrowing_record_return'),
    path('returned-books/count/', ReturnedBookCountView.as_view(), name='returned_books_count'),
    path('borrowing-records/returned/', ReturnedBorrowingRecordListView.as_view(), name='returned-borrowing-record-list'),

    # General Requests
    path('requests/', RequestListCreateView.as_view(), name='request-list-create'),
    path('requests/<int:pk>/accept/', AcceptRequestView.as_view(), name='accept-request'),

    # Notifications
    path('notifications/', NotificationListView.as_view(), name='notification-list'),
    path('notifications/<int:pk>/', NotificationDeleteView.as_view(), name='notification-delete'),
    path('notifications/unread/count/', UnreadNotificationCountView.as_view(), name='unread-notification-count'),
    path('notifications/send-return/<int:user_id>/', send_return_notification, name='send_return_notification'),

    # BorrowRequest (admin approves, etc.)
    path('borrow-requests/', BorrowRequestCreateView.as_view(), name='borrow-request-create'),
    path('admin/requests/pending/', PendingBorrowRequestListView.as_view(), name='admin-pending-requests'),
    path('admin/requests/delete_all/', DeleteAllBorrowRequestsView.as_view(), name='admin-delete-all-requests'),

    # ——— NEW: reply to a message ———
    path(
        'admin/messages/<int:message_id>/reply/',
        reply_to_message,
        name='reply-to-message'
    ),
    
    path(
      'user/request-count/',
      get_user_request_count,
      name='user-request-count'
    ),
    
    path('admin/reset-user-request-count/<int:user_id>/', reset_user_request_count, name='reset-user-request-count'),
]
