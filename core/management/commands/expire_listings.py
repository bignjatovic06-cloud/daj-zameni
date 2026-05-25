from django.core.management.base import BaseCommand
from django.utils import timezone
from core.models import Listing
from core import emails as email_service


class Command(BaseCommand):
    help = 'Expire active listings past their expires_at and notify owners'

    def handle(self, *args, **options):
        now = timezone.now()
        to_expire = (
            Listing.objects
            .filter(status='active', expires_at__isnull=False, expires_at__lte=now)
            .select_related('user')
        )

        count = 0
        for listing in to_expire:
            listing.status = 'expired'
            listing.save(update_fields=['status', 'updated_at'])
            email_service.send_listing_expired(
                to_user       = listing.user,
                listing_title = listing.title,
                listing_id    = str(listing.pk),
            )
            count += 1

        self.stdout.write(f'Expired {count} listings.')
