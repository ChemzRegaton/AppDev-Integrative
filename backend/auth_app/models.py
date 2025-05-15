# auth_app/models.py
from django.contrib.auth.models import AbstractUser
from django.db import models
from .managers import CustomUserManager  # Import CustomUserManager
from django.conf import settings
import uuid

class CustomUser(AbstractUser):
    userId = models.CharField(max_length=50, unique=True, blank=True, null=True, default=uuid.uuid4)
    fullname = models.CharField(max_length=100, blank=True, null=True)
    role = models.CharField(max_length=50, blank=True, null=True)
    studentId = models.CharField(max_length=50, blank=True, null=True) # Add studentId
    age = models.IntegerField(blank=True, null=True) # Add age
    course = models.CharField(max_length=100, blank=True, null=True)
    birthdate = models.DateField(blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    contactNumber = models.CharField(max_length=20, blank=True, null=True) # Add contactNumber
    profile_picture = models.ImageField(upload_to='profile_pics/', blank=True, null=True)
    gender = models.CharField(max_length=10, blank=True, null=True) # Add gender
    section = models.CharField(max_length=50, blank=True, null=True) # Add section
    school_year = models.CharField(max_length=20, blank=True, null=True) # Add school year
    request_count = models.PositiveIntegerField(default=0)

    objects = CustomUserManager()  # Use CustomUserManager
    # Remove the save method here

    def __str__(self):
        return self.username

class Book(models.Model):
    title = models.CharField(max_length=255)
    author = models.CharField(max_length=255, blank=True, null=True)
    isbn = models.CharField(max_length=20, unique=True, blank=True, null=True)
    publication_date = models.DateField(blank=True, null=True)
    genre = models.CharField(max_length=100, blank=True, null=True)
    quantity = models.IntegerField(default=1)

    def __str__(self):
        return self.title


class BookBorrowing(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    book = models.ForeignKey(Book, on_delete=models.CASCADE)
    borrow_date = models.DateField(auto_now_add=True)
    returned_date = models.DateField(null=True, blank=True)
    due_date = models.DateField(null=True, blank=True)

    def __str__(self):
        return f"{self.user} borrowed '{self.book.title}' on {self.borrow_date}"


class ContactMessage(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sent_messages')
    subject = models.CharField(max_length=255)
    message = models.TextField()
    sent_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)
    response = models.TextField(blank=True, null=True)
    responded_at = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return f"Message from {self.user.username} - {self.subject}"