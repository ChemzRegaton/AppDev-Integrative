# auth_app/urls.py
from django.urls import path, include
from .views import RegistrationView, LoginView, UserProfileUpdateView, UserProfileListView, AdminUnreadMessagesCountView, UserDeleteView, UploadProfilePictureView, UsersWithBorrowCountListView, UpdateProfileView, SendMessageToAdminView, AdminReceiveMessagesView, AdminMessageDetailView

urlpatterns = [
    path('register/', RegistrationView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('profile/', UserProfileUpdateView.as_view(), name='update_profile'),
    path('users/', UserProfileListView.as_view(), name='user_list'),
    path('users/<str:pk>/', UserDeleteView.as_view(), name='user_delete'),
    path('admin/users-with-borrow-count/', UsersWithBorrowCountListView.as_view(), name='users-with-borrow-count'),
    path('profile/upload_picture/', UploadProfilePictureView.as_view(), name='upload_profile_picture'),
    path('profile/update/', UpdateProfileView.as_view(), name='update-profile'),
    path('messages/send/', SendMessageToAdminView.as_view(), name='send-message-to-admin'),
    path('admin/messages/', AdminReceiveMessagesView.as_view(), name='admin-receive-messages'),
    path('admin/messages/<int:pk>/', AdminMessageDetailView.as_view(), name='admin-message-detail'),
    path('admin/messages/unread/count/', AdminUnreadMessagesCountView.as_view(), name='admin-unread-messages-count'),
]