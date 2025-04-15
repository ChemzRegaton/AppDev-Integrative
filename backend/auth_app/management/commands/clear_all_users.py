from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    help = 'Deletes all user accounts from the database (use with caution!)'

    def handle(self, *args, **options):
        confirmation = input(
            self.style.WARNING(
                'Are you sure you want to delete ALL user accounts? (yes/no): '
            )
        ).lower()

        if confirmation == 'yes':
            User.objects.exclude(is_superuser=True).delete()  # Exclude superusers
            self.stdout.write(self.style.SUCCESS('Successfully deleted all non-superuser accounts.'))
        else:
            self.stdout.write(self.style.ERROR('Deletion cancelled.'))