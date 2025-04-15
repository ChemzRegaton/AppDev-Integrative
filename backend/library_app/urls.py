# library_app/urls.py
from django.urls import path
from . import views
from .views import TotalBookCount, BookRetrieveUpdateDestroyView, DeleteBookByJSONView, BookListDeleteView, RequestListCreateView, BorrowBookView, BorrowingRecordListView, UserBorrowingRecordListView

urlpatterns = [
    path('books/', views.BookListCreateView.as_view(), name='book-list-create'),
    path('books/<str:book_id>/', BookRetrieveUpdateDestroyView.as_view(), name='book-retrieve-update-destroy'),    
    path('books/', TotalBookCount.as_view(), name='total_book_count'),
    path('books/delete', BookListDeleteView.as_view(), name='book-list-delete'),
    path('books/<str:book_id>/borrow/', BorrowBookView.as_view(), name='borrow-book'),
    path('test-admin-notification/', views.test_admin_notification_sync, name='test-admin-notification'),
    path('borrowing-records/', BorrowingRecordListView.as_view(), name='borrowing-record-list'), # For admin
    path('my-borrowing-records/', UserBorrowingRecordListView.as_view(), name='user-borrowing-record-list'), # For users
    path('requests/', views.RequestListCreateView.as_view(), name='request-list-create'), # For users to create
    path('admin/requests/pending/', views.PendingRequestListView.as_view(), name='admin-pending-requests'), # For admin to view pending
    path('requests/<int:pk>/accept/', views.AcceptRequestView.as_view(), name='accept-request'), # Use pk for request ID
]   