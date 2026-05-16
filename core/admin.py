from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Listing, ListingImage, Category, SwapOffer, Conversation, Message, Review


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display  = ('username', 'email', 'city', 'is_verified', 'rating', 'rating_count', 'date_joined')
    list_filter   = ('is_verified', 'is_staff', 'is_active')
    search_fields = ('username', 'email', 'city')
    fieldsets     = BaseUserAdmin.fieldsets + (
        ('Daj Zameni', {'fields': ('bio', 'city', 'phone', 'is_verified', 'rating', 'rating_count')}),
    )


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display  = ('name', 'slug', 'icon', 'listing_count')
    prepopulated_fields = {'slug': ('name',)}


@admin.register(Listing)
class ListingAdmin(admin.ModelAdmin):
    list_display   = ('title', 'user', 'category', 'listing_type', 'condition', 'status', 'city', 'views', 'created_at')
    list_filter    = ('status', 'listing_type', 'condition', 'category')
    search_fields  = ('title', 'description', 'user__username', 'city')
    readonly_fields = ('id', 'views', 'created_at', 'updated_at')
    raw_id_fields  = ('user', 'category')


@admin.register(ListingImage)
class ListingImageAdmin(admin.ModelAdmin):
    list_display = ('listing', 'is_cover', 'order')
    list_filter  = ('is_cover',)


@admin.register(SwapOffer)
class SwapOfferAdmin(admin.ModelAdmin):
    list_display  = ('from_user', 'to_user', 'listing', 'status', 'created_at')
    list_filter   = ('status',)
    search_fields = ('from_user__username', 'to_user__username')
    readonly_fields = ('id', 'created_at', 'updated_at')


@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ('id', 'listing', 'created_at', 'updated_at')
    filter_horizontal = ('participants',)


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display  = ('sender', 'conversation', 'is_read', 'created_at')
    list_filter   = ('is_read',)
    search_fields = ('sender__username', 'body')


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display  = ('from_user', 'to_user', 'rating', 'created_at')
    list_filter   = ('rating',)
    search_fields = ('from_user__username', 'to_user__username')