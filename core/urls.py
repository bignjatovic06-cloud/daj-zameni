from django.urls import path, re_path
from . import views

urlpatterns = [
    path('', views.app_view, name='app'),

    # ─── Oglasi ───────────────────────────────────────
    path('listings/',                          views.listing_list,           name='listing_list'),
    path('listings/mine/',                     views.my_listings,            name='my_listings'),
    path('listings/wishlist/',                 views.wishlist_list,          name='wishlist_list'),
    path('listings/wishlist/ids/',             views.wishlist_ids,           name='wishlist_ids'),
    path('listings/create/',                   views.listing_create,         name='listing_create'),
    path('listings/<uuid:pk>/',                views.listing_detail,         name='listing_detail'),
    path('listings/<uuid:pk>/update/',         views.listing_update,         name='listing_update'),
    path('listings/<uuid:pk>/delete/',         views.listing_delete,         name='listing_delete'),
    path('listings/<uuid:pk>/images/',         views.listing_image_upload,   name='listing_image_upload'),
    path('listings/<uuid:pk>/offer/',          views.offer_create,           name='offer_create'),
    path('listings/<uuid:pk>/wishlist/',       views.toggle_wishlist,        name='toggle_wishlist'),
    path('listings/<uuid:pk>/thread/',         views.listing_start_thread,   name='listing_start_thread'),
    path('listings/<uuid:pk>/report/',         views.listing_report,         name='listing_report'),

    # ─── Kategorije ───────────────────────────────────
    path('categories/',                        views.category_list,          name='category_list'),

    # ─── Ponude ───────────────────────────────────────
    path('offers/mine/',                       views.my_offers,              name='my_offers'),
    path('offers/<uuid:offer_id>/respond/',    views.offer_respond,          name='offer_respond'),
    path('offers/<uuid:offer_id>/complete/',   views.offer_complete,         name='offer_complete'),
    path('offers/<uuid:offer_id>/review/',     views.offer_review,           name='offer_review'),
    path('profile/reviews/',                   views.my_reviews,             name='my_reviews'),

    # ─── Inbox ────────────────────────────────────────
    path('inbox/',                             views.inbox,                  name='inbox'),
    path('inbox/<int:conversation_id>/',       views.chat,                   name='chat'),
    path('inbox/<int:conversation_id>/messages/<int:message_id>/delete/', views.delete_message, name='delete_message'),

    # ─── Notifikacije ─────────────────────────────────
    path('notifications/',                     views.notifications_view,     name='notifications'),
    path('notifications/read/',                views.notifications_mark_read, name='notifications_mark_read'),

    # ─── Profil ───────────────────────────────────────
    path('profile/',                           views.profile,                name='profile'),
    path('profile/avatar/',                    views.profile_avatar,         name='profile_avatar'),
    path('profile/<str:username>/',            views.profile_user,           name='profile_user'),

    # ─── Auth ─────────────────────────────────────────
    path('auth/status/',                       views.auth_status,            name='auth_status'),
    path('auth/login/',                        views.login_view,             name='login'),
    path('auth/register/',                     views.register,               name='register'),
    path('auth/logout/',                       views.logout_view,            name='logout'),
    path('auth/password/',                     views.change_password,        name='change_password'),
    path('auth/verify/<uuid:token>/',          views.verify_email,           name='verify_email'),
    path('auth/resend-verification/',          views.resend_verification,    name='resend_verification'),

    # ─── SPA catch-all — mora biti poslednji ──────────────
    re_path(r'^(?:oglasi|pretraga|moji-oglasi|sacuvano|ocene|podesavanja|profil)(?:/.*)?$', views.app_view, name='spa_catchall'),
]