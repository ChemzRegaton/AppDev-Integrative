from django.db import migrations
from django.utils.crypto import get_random_string

def generate_unique_user_id():
    return get_random_string(length=50)

def fix_duplicate_user_ids(apps, schema_editor):
    CustomUser = apps.get_model('auth_app', 'CustomUser')
    seen_ids = set()
    duplicates_to_update = []

    for user in CustomUser.objects.all().order_by('id'):
        if user.userId and user.userId in seen_ids:
            new_user_id = generate_unique_user_id()
            while CustomUser.objects.filter(userId=new_user_id).exists():
                new_user_id = generate_unique_user_id()
            duplicates_to_update.append((user, new_user_id))
        elif user.userId:
            seen_ids.add(user.userId)

    for user, new_user_id in duplicates_to_update:
        print(f"Updating user {user.id}: '{user.userId}' -> '{new_user_id}'")
        user.userId = new_user_id
        user.save()

def reverse_fix_duplicate_user_ids(apps, schema_editor):
    pass

class Migration(migrations.Migration):
    dependencies = [
        ('auth_app', '0001_initial'),
    ]
    operations = [
        migrations.RunPython(fix_duplicate_user_ids, reverse_fix_duplicate_user_ids),
    ]