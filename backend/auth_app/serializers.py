# auth_app/serializers.py
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import CustomUser
from rest_framework.authtoken.models import Token

class RegistrationSerializer(serializers.ModelSerializer):
    password2 = serializers.CharField(write_only=True, style={'input_type': 'password'})
    is_superuser = serializers.BooleanField(default=False)  # Add is_superuser field

    class Meta:
        model = CustomUser
        fields = ('userId', 'username', 'fullname', 'role', 'course', 'birthdate', 'email', 'address', 'password', 'password2', 'is_superuser')
        extra_kwargs = {
            'password': {'write_only': True, 'style': {'input_type': 'password'}},
            'email': {'required': True},
            'userId': {'required': False, 'read_only': True},
            'is_superuser': {'write_only': True}  # Make it writable during registration
        }

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError("Passwords do not match.")
        validate_password(data['password'])
        return data

    def create(self, validated_data):
        is_superuser = validated_data.pop('is_superuser', False) # Extract is_superuser
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
        user.is_staff = is_superuser # Typically, superusers are also staff
        user.save()
        return user    
    
class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150, required=True)
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})

    def validate(self, data):
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
    
from rest_framework import serializers
from .models import CustomUser
from .models import BookBorrowing
from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'fullname', 'role', 'studentId', 'age', 'course', 'address', 'contactNumber', 'birthdate'] # Include id, username, email
        read_only_fields = ['id', 'username', 'email'] # Typically these are read-only for profile updates
        
class UserWithBorrowCountSerializer(serializers.ModelSerializer):
    borrowed_count = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'fullname', 'role', 'studentId', 'age', 'course', 'birthdate', 'address', 'contactNumber', 'borrowed_count'] # Include all relevant user fields

    def get_borrowed_count(self, user):
        return BookBorrowing.objects.filter(user=user, returned_date__isnull=True).count()