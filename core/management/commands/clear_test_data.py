from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import transaction
from core.models import (
    Listing, ListingImage, SwapOffer, Conversation,
    Message, Notification, Report, Review, PushSubscription, Category
)

User = get_user_model()


class Command(BaseCommand):
    help = 'Briše sve test korisnike i oglase. Kategorije ostaju.'

    def add_arguments(self, parser):
        parser.add_argument('--confirm', action='store_true', help='Obavezno potvrditi brisanje')

    def handle(self, *args, **options):
        if not options['confirm']:
            self.stdout.write(self.style.WARNING(
                'Dodaj --confirm da potvrdiš brisanje svih korisnika i oglasa.'
            ))
            return

        with transaction.atomic():
            r1 = Message.objects.all().delete()
            r2 = Conversation.objects.all().delete()
            r3 = Notification.objects.all().delete()
            r4 = PushSubscription.objects.all().delete()
            r5 = Review.objects.all().delete()
            r6 = Report.objects.all().delete()
            r7 = SwapOffer.objects.all().delete()
            r8 = ListingImage.objects.all().delete()
            r9 = Listing.objects.all().delete()
            r10 = User.objects.filter(is_superuser=False).delete()

            Category.objects.all().update(listing_count=0)

        self.stdout.write(self.style.SUCCESS('Obrisano:'))
        for label, result in [
            ('Poruke', r1), ('Konverzacije', r2), ('Notifikacije', r3),
            ('Push pretplate', r4), ('Recenzije', r5), ('Prijave', r6),
            ('Ponude', r7), ('Slike oglasa', r8), ('Oglasi', r9), ('Korisnici', r10),
        ]:
            self.stdout.write(f'  {label}: {result[0]}')

        self.stdout.write(self.style.SUCCESS('Kategorije su resetovane. Superuseri su sačuvani.'))
