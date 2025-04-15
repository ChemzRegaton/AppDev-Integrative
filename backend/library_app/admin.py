from django.contrib import admin

# Register your models here.
from library_app.models import Book
from library_app.models import BorrowingRecord

admin.site.register(Book)
admin.site.register(BorrowingRecord)