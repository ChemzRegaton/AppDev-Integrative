from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics, permissions
from rest_framework.authtoken.models import Token
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from django.contrib.auth import authenticate, get_user_model
from django.shortcuts import get_object_or_404
from .models import ContactMessage
from .serializers import ContactMessageSerializer

from .serializers import (
    RegistrationSerializer,
    LoginSerializer,
    UserProfileSerializer,
    UserWithBorrowCountSerializer,
)

User = get_user_model()

class RegistrationView(APIView):
    """
    Handles user registration.
    - POST: Creates a new user and returns a token.
    """
    def post(self, request):
        serializer = RegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            token, created = Token.objects.get_or_create(user=user)
            return Response({'message': 'User registered successfully', 'token': token.key}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    """
    Handles user login.
    - POST: Authenticates the user and returns a token.
    """
    def post(self, request):
        serializer = LoginSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            username = serializer.validated_data['username']
            password = serializer.validated_data['password']
            user = authenticate(request, username=username, password=password)

            if user is not None:
                token, created = Token.objects.get_or_create(user=user)
                return Response({'token': token.key, 'is_superuser': user.is_superuser}, status=status.HTTP_200_OK)
            return Response({'message': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserProfileListView(APIView):
    """
    Lists all user profiles.
    - GET: Returns a list of all users.
    """
    permission_classes = [AllowAny] # Changed to AllowAny
    def get(self, request):
        users = User.objects.all()
        serializer = UserProfileSerializer(users, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    

class UserProfileUpdateView(APIView):
    """
    Retrieves and updates the current user's profile.
    - GET: Returns the current user's profile data.
    - PUT: Updates the current user's profile data.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request):
        serializer = UserProfileSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserDeleteView(APIView):
    """
    Deletes a user.
    - DELETE: Deletes the user with the specified primary key (pk).
    """
    permission_classes = [IsAuthenticated, IsAdminUser]

    def delete(self, request, pk):
        user = get_object_or_404(User, pk=pk)
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class UserProfileDetailView(APIView):
    """
    Retrieves and updates the current user's profile.  Added in previous turn, but
    worth keeping for clarity.  This seems redundant with UserProfileUpdateView.
    - GET: Returns the current user's profile.
    - PUT: Updates the current user's profile.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request):
        serializer = UserProfileSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            response_data = serializer.data
            response_data['id'] = request.user.id
            response_data['username'] = request.user.username
            response_data['email'] = request.user.email
            return Response(response_data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UsersWithBorrowCountListView(APIView):
    """
    Lists all users with their borrow counts.
    - GET: Returns a list of all users with their borrow counts.
    """
    permission_classes = [IsAdminUser]  # Removed AllowAny as it's for admin-specific data

    def get(self, request):
        users = User.objects.all()
        serializer = UserWithBorrowCountSerializer(users, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class UploadProfilePictureView(APIView):
    """
    Handles profile picture uploads.
    - POST: Updates the user's profile picture.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        serializer = UserProfileSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            #  Return the full URL,  use request.build_absolute_uri
            profile_picture_url = request.build_absolute_uri(serializer.data.get('profile_picture'))
            return Response({'message': 'Profile picture updated successfully.', 'profile_picture': profile_picture_url}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request):
        user = request.user
        serializer = UserProfileSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            profile_picture_url = request.build_absolute_uri(serializer.data.get('profile_picture'))
            return Response({'message': 'Profile picture updated successfully.', 'profile_picture': profile_picture_url}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UpdateProfileView(APIView):
    """
    Handles updating the user's profile data.
    - PUT: Updates the user's profile data.
    - PATCH: Updates part of the user's profile data.
    """
    permission_classes = [IsAuthenticated]

    def put(self, request):
        user = request.user
        serializer = UserProfileSerializer(user, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'Profile updated successfully!', 'profile': serializer.data}, status=status.HTTP_200_OK)
        else:
            print("Serializer Errors:", serializer.errors)  # Keep this for debugging
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request):
        user = request.user
        serializer = UserProfileSerializer(user, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'Profile updated successfully!', 'profile': serializer.data}, status=status.HTTP_200_OK)
        else:
            print("Serializer Errors:", serializer.errors)  # Keep this for debugging
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class SendMessageToAdminView(generics.CreateAPIView):
    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class AdminReceiveMessagesView(generics.ListAPIView): # Changed to generics.ListAPIView
    """
    View to get all contact messages for admin
    """
    queryset = ContactMessage.objects.all().order_by('-sent_at')
    serializer_class = ContactMessageSerializer
    permission_classes = [permissions.AllowAny]

class AdminMessageDetailView(generics.RetrieveUpdateAPIView): # Changed to generics.RetrieveUpdateAPIView
    """
    View for admin to see a specific contact message and update it (e.g., mark as read, add response)
    """
    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageSerializer
    permission_classes = [permissions.AllowAny]

class AdminUnreadMessagesCountView(generics.RetrieveAPIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, *args, **kwargs):
        unread_count = ContactMessage.objects.filter(is_read=False).count()
        return Response({'count': unread_count})
    

from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.conf import settings

@api_view(['GET'])
def get_api_base_url(request):
    """
    Returns the API base URL from Django settings.
    """
    return Response({'api_base_url': settings.API_BASE_URL})

