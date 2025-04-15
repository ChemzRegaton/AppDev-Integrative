from django.db import models
from django.conf import settings
from django.db.models import Sum
from django.utils import timezone

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
    return_date = models.DateTimeField(null=True, blank=True)
    is_returned = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.user.username} borrowed '{self.book.title}' on {self.borrow_date}"