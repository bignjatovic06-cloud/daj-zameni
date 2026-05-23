from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from core.models import SwapOffer
from core import emails as email_service


class Command(BaseCommand):
    help = 'Send reminders for pending offers after 48h; cancel after 7 days'

    def handle(self, *args, **options):
        now = timezone.now()

        # Auto-cancel offers pending for 7+ days
        expired = SwapOffer.objects.filter(
            status='pending',
            created_at__lt=now - timedelta(days=7),
        )
        count_cancelled = expired.count()
        expired.update(status='cancelled')
        self.stdout.write(f'Cancelled {count_cancelled} expired offers.')

        # Send reminder for offers pending 48h+ without reminder
        to_remind = SwapOffer.objects.filter(
            status='pending',
            reminder_sent=False,
            created_at__lt=now - timedelta(hours=48),
        ).select_related('listing', 'from_user', 'to_user')

        count_reminded = 0
        for offer in to_remind:
            email_service.send_offer_reminder(
                to_user       = offer.to_user,
                from_username = offer.from_user.username,
                listing_title = offer.listing.title,
            )
            offer.reminder_sent = True
            offer.save(update_fields=['reminder_sent'])
            count_reminded += 1

        self.stdout.write(f'Sent {count_reminded} reminders.')
