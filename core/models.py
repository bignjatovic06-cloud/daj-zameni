from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.text import slugify
import uuid


class User(AbstractUser):
    bio          = models.TextField(blank=True)
    avatar       = models.ImageField(upload_to='avatars/', blank=True, null=True)
    city         = models.CharField(max_length=100, blank=True)
    phone        = models.CharField(max_length=20, blank=True)
    is_verified  = models.BooleanField(default=False)
    rating       = models.DecimalField(max_digits=3, decimal_places=2, default=0.00)
    rating_count = models.PositiveIntegerField(default=0)
    wishlist     = models.ManyToManyField('Listing', related_name='wishlisted_by', blank=True)
    created_at   = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.username


class Category(models.Model):
    name          = models.CharField(max_length=100)
    slug          = models.CharField(max_length=150, unique=True)
    icon          = models.CharField(max_length=50, blank=True)
    tint          = models.CharField(max_length=20, blank=True)
    parent        = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='children')
    order         = models.PositiveSmallIntegerField(default=0)
    listing_count = models.PositiveIntegerField(default=0)

    class Meta:
        verbose_name_plural = 'Categories'
        ordering = ['order', 'name']

    def __str__(self):
        return self.name


class Listing(models.Model):
    CONDITION_CHOICES = [
        ('new',      'Novo'),
        ('like_new', 'Polovno — kao novo'),
        ('good',     'Polovno — odlično'),
        ('fair',     'Polovno — vrlo dobro'),
        ('poor',     'Polovno — dobro'),
        ('antique',  'Antikvitet'),
    ]
    TYPE_CHOICES = [
        ('sell',   'Prodaja'),
        ('barter', 'Zamena'),
        ('both',   'Prodaja ili zamena'),
    ]
    STATUS_CHOICES = [
        ('active',   'Aktivan'),
        ('reserved', 'Rezervisan'),
        ('closed',   'Zatvoren'),
    ]

    id            = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user          = models.ForeignKey(User, on_delete=models.CASCADE, related_name='listings')
    category      = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='listings')

    title         = models.CharField(max_length=200)
    slug          = models.SlugField(max_length=220, unique=True, blank=True)
    description   = models.TextField()
    price         = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    listing_type  = models.CharField(max_length=10, choices=TYPE_CHOICES, default='both')
    condition     = models.CharField(max_length=10, choices=CONDITION_CHOICES, default='good')
    status        = models.CharField(max_length=10, choices=STATUS_CHOICES, default='active')

    city              = models.CharField(max_length=100, blank=True)
    wants_in_exchange = models.TextField(blank=True)

    views       = models.PositiveIntegerField(default=0)
    is_featured = models.BooleanField(default=False)
    is_premium  = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.id:
            self.id = uuid.uuid4()
        if not self.slug:
            base = slugify(self.title)
            self.slug = f"{base}-{str(self.id)[:8]}"
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title


class ListingImage(models.Model):
    listing  = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name='images')
    image    = models.ImageField(upload_to='listings/')
    is_cover = models.BooleanField(default=False)
    order    = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ['order']


class SwapOffer(models.Model):
    STATUS_CHOICES = [
        ('pending',   'Na čekanju'),
        ('accepted',  'Prihvaćena'),
        ('declined',  'Odbijena'),
        ('completed', 'Završena'),
        ('cancelled', 'Otkazana'),
    ]

    id              = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    listing         = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name='offers')
    from_user       = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_offers')
    to_user         = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_offers')
    offered_listing = models.ForeignKey(Listing, on_delete=models.SET_NULL, null=True, blank=True, related_name='offered_in')
    message             = models.TextField(blank=True)
    cash_offer          = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    status              = models.CharField(max_length=12, choices=STATUS_CHOICES, default='pending')
    completed_by_from   = models.BooleanField(default=False)
    completed_by_to     = models.BooleanField(default=False)
    created_at          = models.DateTimeField(auto_now_add=True)
    updated_at          = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.from_user} → {self.listing}"


class Conversation(models.Model):
    participants = models.ManyToManyField(User, related_name='conversations')
    listing      = models.ForeignKey(Listing, on_delete=models.SET_NULL, null=True, blank=True)
    created_at   = models.DateTimeField(auto_now_add=True)
    updated_at   = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']


class Message(models.Model):
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages')
    sender       = models.ForeignKey(User, on_delete=models.CASCADE)
    body         = models.TextField(blank=True)
    swap_offer   = models.ForeignKey(SwapOffer, on_delete=models.SET_NULL, null=True, blank=True, related_name='chat_messages')
    is_read      = models.BooleanField(default=False)
    created_at   = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"{self.sender}: {self.body[:40]}"


class Notification(models.Model):
    TYPE_CHOICES = [
        ('message',         'Nova poruka'),
        ('offer',           'Nova ponuda'),
        ('offer_accepted',  'Ponuda prihvaćena'),
        ('offer_declined',  'Ponuda odbijena'),
        ('review',          'Nova recenzija'),
    ]

    user       = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    type       = models.CharField(max_length=20, choices=TYPE_CHOICES, default='message')
    text       = models.CharField(max_length=255)
    is_read    = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user} — {self.text[:40]}"


class Report(models.Model):
    REASON_CHOICES = [
        ('spam',          'Spam ili prevara'),
        ('inappropriate', 'Neprikladan sadržaj'),
        ('wrong_cat',     'Pogrešna kategorija'),
        ('duplicate',     'Duplikat oglasa'),
        ('other',         'Ostalo'),
    ]

    listing    = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name='reports')
    reporter   = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reports_made')
    reason     = models.CharField(max_length=20, choices=REASON_CHOICES, default='other')
    details    = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    resolved   = models.BooleanField(default=False)

    class Meta:
        ordering = ['-created_at']
        unique_together = [('listing', 'reporter')]

    def __str__(self):
        return f'{self.reporter} → {self.listing.title[:40]} ({self.reason})'


class Review(models.Model):
    from_user  = models.ForeignKey(User, on_delete=models.CASCADE, related_name='given_reviews')
    to_user    = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_reviews')
    swap_offer = models.ForeignKey(SwapOffer, on_delete=models.CASCADE, related_name='reviews')
    rating     = models.PositiveSmallIntegerField()
    comment    = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = [('from_user', 'swap_offer')]

    def __str__(self):
        return f"{self.from_user} → {self.to_user}: {self.rating}★"