from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import CustomUser, BookBorrowing, ContactMessage # Import ContactMessage
from rest_framework.authtoken.models import Token
from django.contrib.auth import get_user_model

User = get_user_model()

class RegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration.
    - Handles fields: userId, username, fullname, role, course, birthdate, email, address, password, password2, is_superuser.
    - Validates password matching and complexity.
    - Creates a new user with the given data.
    """
    password2 = serializers.CharField(write_only=True, style={'input_type': 'password'})
    is_superuser = serializers.BooleanField(default=False)

    class Meta:
        model = CustomUser
        fields = ('userId', 'username', 'fullname', 'role', 'course', 'birthdate', 'email', 'address', 'password', 'password2', 'is_superuser')
        extra_kwargs = {
            'password': {'write_only': True, 'style': {'input_type': 'password'}},
            'email': {'required': True},
            'userId': {'required': False, 'read_only': True},
            'is_superuser': {'write_only': True}
        }

    def validate(self, data):
        """
        Validates that the two password fields match and the password meets complexity requirements.
        """
        if data['password'] != data['password2']:
            raise serializers.ValidationError("Passwords do not match.")
        validate_password(data['password'])
        return data

    def create(self, validated_data):
        """
        Creates a new user instance.
        """
        is_superuser = validated_data.pop('is_superuser', False)
        user = CustomUser.objects.create_user(
            userId=validated_data.get('userId'),
            username=validated_data['username'],
            fullname=validated_data.get('fullname'),
            role=validated_data.get('role'),
            course=validated_data.get('course'),
            birthdate=validated_data.get('birthdate'),
            email=validated_data['email'],
            address=validated_data.get('address'),
            password=validated_data['password']
        )
        user.is_superuser = is_superuser
        user.is_staff = is_superuser
        user.save()
        return user


class LoginSerializer(serializers.Serializer):
    """
    Serializer for user login.
    - Handles fields: username, password.
    - Authenticates the user and raises an error for invalid credentials.
    """
    username = serializers.CharField(max_length=150, required=True)
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})

    def validate(self, data):
        """
        Validates the username and password against Django's authentication system.
        """
        username = data.get('username')
        password = data.get('password')

        if username and password:
            from django.contrib.auth import authenticate
            user = authenticate(request=self.context.get('request'), username=username, password=password)
            if user:
                if not user.is_active:
                    raise serializers.ValidationError("User account is disabled.")
                data['user'] = user
            else:
                raise serializers.ValidationError("Invalid credentials.")
        else:
            raise serializers.ValidationError("Must include 'username' and 'password'.")

        return data



class UserProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for user profile information.
    - Includes fields: id, username, email, fullname, role, studentId, age, course, address, contactNumber, birthdate, profile_picture, gender, section, school_year.
    -  id, username, and email are read-only.
    - profile_picture is now optional and can handle both file uploads and URLs.
    """
    profile_picture = serializers.ImageField(required=False)  # Make profile_picture optional

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'fullname', 'role', 'studentId', 'age', 'course', 'address', 'contactNumber', 'birthdate', 'profile_picture', 'gender', 'section', 'school_year']
        read_only_fields = ['id', 'username', 'email']



class UserWithBorrowCountSerializer(serializers.ModelSerializer):
    """
    Serializer for user information along with the count of books currently borrowed.
    - Includes all user fields and a 'borrowed_count' field.
    """
    borrowed_count = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'fullname', 'role', 'request_count', 'studentId', 'age', 'course', 'birthdate', 'address', 'contactNumber', 'borrowed_count']

    def get_borrowed_count(self, user):
        """
        Calculates the number of books the user has currently borrowed.
        """
        return BookBorrowing.objects.filter(user=user, returned_date__isnull=True).count()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username'] # Include relevant user details

class ContactMessageSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = ContactMessage
        fields = ['id', 'user', 'subject', 'content', 'sent_at', 'is_read', 'response', 'responded_at']
        read_only_fields = ['id', 'user', 'sent_at', 'is_read', 'response', 'responded_at']