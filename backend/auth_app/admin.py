from django.contrib import admin

# Register your models here.
from auth_app.models import CustomUser


admin.site.register(CustomUser)
