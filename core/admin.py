from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.html import format_html
from django.db.models import Count
from .models import (
    User, Listing, ListingImage, Category,
    SwapOffer, Conversation, Message,
    Review, Report, Notification, PushSubscription,
)


# ─── User ────────────────────────────────────────────────────────────────────

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display   = ('username', 'email', 'city', 'is_verified', 'is_active', 'rating', 'rating_count', 'listing_count', 'date_joined')
    list_filter    = ('is_verified', 'is_active', 'is_staff')
    search_fields  = ('username', 'email', 'city')
    list_editable  = ('is_verified', 'is_active')
    date_hierarchy = 'date_joined'
    fieldsets      = BaseUserAdmin.fieldsets + (
        ('Daj Zameni', {'fields': ('bio', 'avatar', 'city', 'phone', 'is_verified', 'rating', 'rating_count')}),
    )

    def listing_count(self, obj):
        return obj.listings.count()
    listing_count.short_description = 'Oglasi'

    def get_queryset(self, request):
        return super().get_queryset(request).prefetch_related('listings')


# ─── Category ────────────────────────────────────────────────────────────────

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display        = ('name', 'slug', 'icon', 'parent', 'order', 'listing_count')
    list_editable       = ('order',)
    prepopulated_fields = {'slug': ('name',)}
    search_fields       = ('name',)


# ─── Listing ─────────────────────────────────────────────────────────────────

class ListingImageInline(admin.TabularInline):
    model       = ListingImage
    extra       = 0
    readonly_fields = ('thumbnail',)
    fields      = ('thumbnail', 'image', 'is_cover', 'order')

    def thumbnail(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="height:60px;border-radius:4px;">', obj.image.url)
        return '—'
    thumbnail.short_description = 'Preview'


@admin.register(Listing)
class ListingAdmin(admin.ModelAdmin):
    list_display    = ('title', 'user', 'category', 'listing_type', 'condition', 'status', 'city', 'views', 'report_count', 'created_at')
    list_filter     = ('status', 'listing_type', 'condition', 'is_featured', 'is_premium', 'category')
    search_fields   = ('title', 'description', 'user__username', 'city')
    list_editable   = ('status',)
    readonly_fields = ('id', 'views', 'created_at', 'updated_at')
    raw_id_fields   = ('user', 'category')
    date_hierarchy  = 'created_at'
    inlines         = [ListingImageInline]

    def report_count(self, obj):
        count = getattr(obj, '_report_count', 0)
        if count:
            return format_html('<strong style="color:#c0392b">{} ⚑</strong>', count)
        return '—'
    report_count.short_description = 'Prijave'
    report_count.admin_order_field = '_report_count'

    def get_queryset(self, request):
        return super().get_queryset(request).annotate(
            _report_count=Count('reports', filter=__import__('django.db.models', fromlist=['Q']).Q(reports__resolved=False))
        )


# ─── SwapOffer ───────────────────────────────────────────────────────────────

@admin.register(SwapOffer)
class SwapOfferAdmin(admin.ModelAdmin):
    list_display    = ('from_user', 'listing', 'to_user', 'status', 'cash_offer', 'reminder_sent', 'created_at')
    list_filter     = ('status', 'reminder_sent')
    search_fields   = ('from_user__username', 'to_user__username', 'listing__title')
    readonly_fields = ('id', 'created_at', 'updated_at')
    date_hierarchy  = 'created_at'
    raw_id_fields   = ('from_user', 'to_user', 'listing', 'offered_listing')


# ─── Report ──────────────────────────────────────────────────────────────────

def delete_reported_listing(modeladmin, request, queryset):
    for report in queryset.select_related('listing'):
        report.listing.delete()
    queryset.update(resolved=True)
delete_reported_listing.short_description = 'Obriši oglas i označi kao rešeno'


def mark_resolved(modeladmin, request, queryset):
    queryset.update(resolved=True)
mark_resolved.short_description = 'Označi kao rešeno (bez brisanja)'


@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display    = ('created_at', 'listing_link', 'reporter', 'reason', 'total_reports', 'resolved')
    list_filter     = ('reason', 'resolved')
    search_fields   = ('listing__title', 'reporter__username', 'details')
    readonly_fields = ('listing', 'reporter', 'reason', 'details', 'created_at')
    actions         = [delete_reported_listing, mark_resolved]
    date_hierarchy  = 'created_at'
    ordering        = ('resolved', '-created_at')

    def listing_link(self, obj):
        return format_html(
            '<a href="/admin/core/listing/{}/change/">{}</a>',
            obj.listing.pk, obj.listing.title[:60]
        )
    listing_link.short_description = 'Oglas'

    def total_reports(self, obj):
        count = Report.objects.filter(listing=obj.listing, resolved=False).count()
        if count > 1:
            return format_html('<strong style="color:#c0392b">{} prijava</strong>', count)
        return count
    total_reports.short_description = 'Ukupno prijava'


# ─── Review ──────────────────────────────────────────────────────────────────

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display    = ('from_user', 'to_user', 'stars', 'comment_preview', 'created_at')
    list_filter     = ('rating',)
    search_fields   = ('from_user__username', 'to_user__username', 'comment')
    readonly_fields = ('from_user', 'to_user', 'swap_offer', 'rating', 'comment', 'created_at')
    date_hierarchy  = 'created_at'

    def stars(self, obj):
        return '★' * obj.rating + '☆' * (5 - obj.rating)
    stars.short_description = 'Ocena'

    def comment_preview(self, obj):
        return obj.comment[:80] if obj.comment else '—'
    comment_preview.short_description = 'Komentar'


# ─── Notification ────────────────────────────────────────────────────────────

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display   = ('user', 'type', 'text_preview', 'is_read', 'created_at')
    list_filter    = ('type', 'is_read')
    search_fields  = ('user__username', 'text')
    date_hierarchy = 'created_at'

    def text_preview(self, obj):
        return obj.text[:80]
    text_preview.short_description = 'Tekst'


# ─── PushSubscription ────────────────────────────────────────────────────────

@admin.register(PushSubscription)
class PushSubscriptionAdmin(admin.ModelAdmin):
    list_display  = ('user', 'endpoint_preview', 'created_at')
    search_fields = ('user__username',)
    readonly_fields = ('user', 'endpoint', 'subscription_json', 'created_at')
    date_hierarchy = 'created_at'

    def endpoint_preview(self, obj):
        return obj.endpoint[:80] + '…'
    endpoint_preview.short_description = 'Endpoint'


# ─── Conversation / Message (read-only za moderaciju) ────────────────────────

@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display      = ('id', 'listing', 'participant_list', 'updated_at')
    filter_horizontal = ('participants',)
    readonly_fields   = ('participants', 'listing', 'created_at', 'updated_at')
    date_hierarchy    = 'created_at'

    def participant_list(self, obj):
        return ', '.join(u.username for u in obj.participants.all())
    participant_list.short_description = 'Učesnici'


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display  = ('sender', 'conversation', 'body_preview', 'is_read', 'created_at')
    list_filter   = ('is_read',)
    search_fields = ('sender__username', 'body')
    readonly_fields = ('sender', 'conversation', 'body', 'swap_offer', 'is_read', 'created_at')
    date_hierarchy = 'created_at'

    def body_preview(self, obj):
        return obj.body[:80] if obj.body else '—'
    body_preview.short_description = 'Poruka'
