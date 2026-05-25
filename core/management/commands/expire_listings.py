from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from core.models import Listing, Notification
from core import emails as email_service
from core import push as push_service

REMINDER_DAYS_BEFORE = 2


class Command(BaseCommand):
    help = 'Remind owners before expiry, then expire active listings past expires_at'

    def handle(self, *args, **options):
        now = timezone.now()

        # 1) Remind owners whose listing expires within REMINDER_DAYS_BEFORE
        soon = (
            Listing.objects
            .filter(
                status='active',
                expiry_reminder_sent=False,
                expires_at__isnull=False,
                expires_at__gt=now,
                expires_at__lte=now + timedelta(days=REMINDER_DAYS_BEFORE),
            )
            .select_related('user')
        )
        reminded = 0
        for listing in soon:
            days_left = max(1, (listing.expires_at - now).days)
            email_service.send_listing_expiring_soon(
                to_user       = listing.user,
                listing_title = listing.title,
                days_left     = days_left,
            )
            Notification.objects.create(
                user = listing.user,
                type = 'listing_expiring',
                text = f'Tvoj oglas „{listing.title}" uskoro ističe — produži ga besplatno.',
            )
            push_service.send_push_to_user(
                listing.user,
                'Oglas uskoro ističe',
                f'„{listing.title}" — produži besplatno.',
                '/moji-oglasi',
            )
            listing.expiry_reminder_sent = True
            listing.save(update_fields=['expiry_reminder_sent'])
            reminded += 1
        self.stdout.write(f'Sent {reminded} expiry reminders.')

        # 2) Expire active listings past expires_at
        to_expire = (
            Listing.objects
            .filter(status='active', expires_at__isnull=False, expires_at__lte=now)
            .select_related('user')
        )
        expired = 0
        for listing in to_expire:
            listing.status = 'expired'
            listing.save(update_fields=['status', 'updated_at'])
            email_service.send_listing_expired(
                to_user       = listing.user,
                listing_title = listing.title,
                listing_id    = str(listing.pk),
            )
            expired += 1
        self.stdout.write(f'Expired {expired} listings.')
