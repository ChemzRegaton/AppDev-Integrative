# auth_app/urls.py
from django.urls import path
from .views import RegistrationView, LoginView, UserProfileUpdateView, UserProfileListView, UserDeleteView, UsersWithBorrowCountListView

urlpatterns = [
    path('register/', RegistrationView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('profile/', UserProfileUpdateView.as_view(), name='update_profile'),
    path('users/', UserProfileListView.as_view(), name='user_list'),
    path('users/<str:pk>/', UserDeleteView.as_view(), name='user_delete'),
    path('admin/users-with-borrow-count/', UsersWithBorrowCountListView.as_view(), name='users-with-borrow-count'),
]