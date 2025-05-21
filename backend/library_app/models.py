from django.db import models
from django.conf import settings
from django.db.models import Sum
from django.utils import timezone
from auth_app.models import CustomUser


class Book(models.Model):
    book_id = models.CharField(max_length=8, primary_key=True, unique=True, editable=False, default='generate_book_id')
    title = models.CharField(max_length=255)
    author = models.CharField(max_length=255)
    publication_year = models.IntegerField(null=True, blank=True)
    publisher = models.CharField(max_length=255, blank=True)
    category = models.CharField(max_length=100, blank=True)
    quantity = models.IntegerField()
    available_quantity = models.IntegerField()
    location = models.CharField(max_length=100, blank=True)
    date_added = models.DateField(auto_now_add=True)
    cover_image = models.ImageField(upload_to='book_covers/', null=True, blank=True)

    def generate_book_id(self):
        now = timezone.now()
        year_short = str(now.year)[2:]
        timestamp = str(int(now.timestamp()))[-4:]
        return f"BK{year_short}{timestamp}"

    def save(self, *args, **kwargs):
        if not self.book_id or self.book_id == 'generate_book_id':
            self.book_id = self.generate_book_id()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title

    @staticmethod
    def get_total_books():
        total = Book.objects.aggregate(Sum('quantity'))['quantity__sum'] or 0
        return total

class Request(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('borrowed', 'Borrowed'),
        ('returned', 'Returned'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    book = models.ForeignKey(Book, on_delete=models.CASCADE)
    request_date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default='pending'
    )
    borrow_date = models.DateField(null=True, blank=True)
    return_date = models.DateField(null=True, blank=True)

    def __str__(self):
        return f"Request for '{self.book.title}' ({self.book.book_id}) by {self.user.get_username()}"

class BorrowingRecord(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    book = models.ForeignKey(Book, on_delete=models.CASCADE)
    borrow_date = models.DateTimeField(auto_now_add=True)
    return_date = models.DateTimeField(null=True, blank=True) # Actual return date
    is_returned = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.user.username} borrowed '{self.book.title}' on {self.borrow_date}"

    @property
    def due_date(self):
        """Calculates the due date (e.g., 10 days after borrow_date)."""
        if self.borrow_date:
            return self.borrow_date + timezone.timedelta(days=10)
        return None
        
class BorrowRequest(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    book = models.ForeignKey(Book, on_delete=models.CASCADE)
    request_date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(
        max_length=10,
        choices=[
            ('pending', 'Pending'),
            ('accepted', 'Accepted'),
            ('rejected', 'Rejected'),
        ],
        default='pending'
    )
    requester_profile_picture = models.CharField(max_length=255, blank=True, null=True)  # Store the path

    def __str__(self):
        return f"{self.user.username} requested '{self.book.title}' on {self.request_date} ({self.status})"
class UserProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='userprofile')
    first_name = models.CharField(max_length=100, blank=True)
    last_name = models.CharField(max_length=100, blank=True)
    gender = models.CharField(max_length=10, choices=[('male', 'Male'), ('female', 'Female'), ('other', 'Other')], blank=True)
    role = models.CharField(max_length=100, blank=True)
    course = models.CharField(max_length=100, blank=True)
    birthdate = models.DateField(null=True, blank=True)
    address = models.TextField(blank=True)

    def __str__(self):
        return f"{self.user.username}'s Profile"

class Notification(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    message = models.TextField()
    book = models.ForeignKey(
        Book,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    status = models.CharField( # Or 'notification_type' if you changed it in the model
        max_length=50,
        blank=True,
        null=True,
        choices=[
            ('accepted', 'Accepted'),
            ('rejected', 'Rejected'),
            ('returned', 'Returned'),
            ('overdue_reminder', 'Overdue Reminder'),
            ('general', 'General'),
        ]
    )
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False) # Keep this for tracking read status

    def __str__(self):
        return f"Notification for {self.user.username}: {self.message[:50]}"    
class AdminActionLog(models.Model):
    timestamp = models.DateTimeField(auto_now_add=True)
    admin_user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='admin_logs')
    action = models.CharField(max_length=255)
    details = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.timestamp} - {self.admin_user} - {self.action}"    

class Reply(models.Model):
    message = models.ForeignKey('library_app.Message', on_delete=models.CASCADE, related_name='replies')
    content = models.TextField()
    sent_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Reply to Message ID {self.message.id}"


    
class Message(models.Model):
    sender = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='sent_messages')
    recipient = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='received_messages')
    content = models.TextField()
    sent_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"From {self.sender.username} to {self.recipient.username} - {self.sent_at}"

