from django.contrib import admin

# Register your models here.
from library_app.models import Book
from library_app.models import BorrowingRecord
from library_app.models import BorrowRequest

admin.site.register(Book)
admin.site.register(BorrowingRecord)
admin.site.register(BorrowRequest)