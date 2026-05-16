from django.shortcuts import render, get_object_or_404
from django.contrib.auth import authenticate, login, logout, get_user_model
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_POST, require_http_methods
from django.db.models import Q
from django.core.paginator import Paginator
import json

from .models import Listing, ListingImage, Category, SwapOffer, Conversation, Message, Notification, Review

User = get_user_model()


# ─────────────────────────────────────────
#  MAIN APP VIEW
# ─────────────────────────────────────────

@ensure_csrf_cookie
def app_view(request):
    return render(request, 'core/app.html')


# ─────────────────────────────────────────
#  AUTH VIEWS
# ─────────────────────────────────────────

def auth_status(request):
    if request.user.is_authenticated:
        return JsonResponse({'authenticated': True, 'user': _user_data(request.user)})
    return JsonResponse({'authenticated': False, 'user': None})


@require_http_methods(['POST'])
def register(request):
    data     = _parse(request)
    username = data.get('username', '').strip()
    email    = data.get('email', '').strip()
    password = data.get('password', '')

    errors = {}
    if not username:
        errors['username'] = ['Korisničko ime je obavezno.']
    elif User.objects.filter(username=username).exists():
        errors['username'] = ['Korisničko ime je zauzeto.']
    if not email:
        errors['email'] = ['Email je obavezan.']
    elif User.objects.filter(email=email).exists():
        errors['email'] = ['Email je već registrovan.']
    if len(password) < 8:
        errors['password'] = ['Lozinka mora imati najmanje 8 karaktera.']

    if errors:
        return JsonResponse(errors, status=400)

    user = User.objects.create_user(username=username, email=email, password=password)
    login(request, user)
    return JsonResponse({'user': _user_data(user)}, status=201)


@require_http_methods(['POST'])
def login_view(request):
    data     = _parse(request)
    username = data.get('username', '').strip()
    password = data.get('password', '')

    user = authenticate(request, username=username, password=password)
    if user is None:
        return JsonResponse({'detail': 'Pogrešno korisničko ime ili lozinka.'}, status=401)

    login(request, user)
    return JsonResponse({'user': _user_data(user)})


@require_POST
def logout_view(request):
    logout(request)
    return JsonResponse({'ok': True})


# ─────────────────────────────────────────
#  LISTINGS
# ─────────────────────────────────────────

def listing_list(request):
    qs = (
        Listing.objects
        .filter(status='active')
        .select_related('user', 'category', 'category__parent')
        .prefetch_related('images')
    )

    q     = request.GET.get('q', '').strip()
    cat   = request.GET.get('category', '')
    city  = request.GET.get('city', '').strip()
    ltype = request.GET.get('type', '')
    sort  = request.GET.get('sort', '-created_at')

    if q:
        qs = qs.filter(Q(title__icontains=q) | Q(description__icontains=q))
    if cat:
        qs = qs.filter(Q(category__slug=cat) | Q(category__parent__slug=cat))
    if city:
        qs = qs.filter(city__icontains=city)
    if ltype == 'barter':
        qs = qs.filter(listing_type__in=('barter', 'both'))
    elif ltype == 'sell':
        qs = qs.filter(listing_type__in=('sell', 'both'))
    elif ltype == 'both':
        qs = qs.filter(listing_type='both')

    if sort in ('created_at', '-created_at', 'price', '-price'):
        qs = qs.order_by(sort)

    paginator = Paginator(qs, 20)
    page      = paginator.get_page(request.GET.get('page', 1))

    return JsonResponse({
        'results':  [_listing_data(l) for l in page],
        'count':    paginator.count,
        'pages':    paginator.num_pages,
        'page':     page.number,
        'has_next': page.has_next(),
    })


def listing_detail(request, pk):
    listing = get_object_or_404(
        Listing.objects
        .select_related('user', 'category', 'category__parent')
        .prefetch_related('images'),
        pk=pk,
    )
    Listing.objects.filter(pk=pk).update(views=listing.views + 1)
    return JsonResponse(_listing_data(listing, full=True))


@login_required
@require_http_methods(['POST'])
def listing_create(request):
    data  = _parse(request)
    ltype = data.get('listing_type', 'both')

    category = None
    if data.get('category'):
        category = Category.objects.filter(slug=data['category']).first()

    listing = Listing.objects.create(
        user              = request.user,
        category          = category,
        title             = data.get('title', '').strip(),
        description       = data.get('description', '').strip(),
        price             = data.get('price') or None,
        listing_type      = ltype,
        condition         = data.get('condition', 'good'),
        city              = data.get('city', '').strip(),
        wants_in_exchange = data.get('wants_in_exchange', '').strip(),
    )
    return JsonResponse({'ok': True, 'listing': _listing_data(listing)}, status=201)


@login_required
@require_http_methods(['PUT', 'PATCH'])
def listing_update(request, pk):
    listing = get_object_or_404(Listing, pk=pk, user=request.user)
    data    = _parse(request)

    field_map = {
        'title':             'title',
        'description':       'description',
        'price':             'price',
        'condition':         'condition',
        'city':              'city',
        'wants_in_exchange': 'wants_in_exchange',
        'status':            'status',
    }
    for api_f, model_f in field_map.items():
        if api_f in data:
            setattr(listing, model_f, data[api_f])

    if 'listing_type' in data:
        listing.listing_type = data['listing_type']

    listing.save()
    return JsonResponse({'ok': True, 'listing': _listing_data(listing)})


@login_required
@require_http_methods(['DELETE'])
def listing_delete(request, pk):
    listing = get_object_or_404(Listing, pk=pk, user=request.user)
    listing.status = 'closed'
    listing.save()
    return JsonResponse({'ok': True})


@login_required
@require_POST
def listing_image_upload(request, pk):
    listing = get_object_or_404(Listing, pk=pk, user=request.user)
    images  = request.FILES.getlist('images')

    if not images:
        return JsonResponse({'error': 'Nema slika.'}, status=400)

    created = []
    for i, img in enumerate(images):
        is_cover = (i == 0 and not listing.images.exists())
        li = ListingImage.objects.create(
            listing  = listing,
            image    = img,
            is_cover = is_cover,
            order    = listing.images.count(),
        )
        created.append({'url': li.image.url, 'is_cover': li.is_cover})

    return JsonResponse({'ok': True, 'images': created})


@login_required
@require_POST
def toggle_wishlist(request, pk):
    listing = get_object_or_404(Listing, pk=pk)
    if listing.user == request.user:
        return JsonResponse({'error': 'cannot_save_own'}, status=400)
    if request.user.wishlist.filter(pk=pk).exists():
        request.user.wishlist.remove(listing)
        saved = False
    else:
        request.user.wishlist.add(listing)
        saved = True
    return JsonResponse({'ok': True, 'saved': saved})


@login_required
def wishlist_list(request):
    listings = (
        request.user.wishlist
        .filter(status='active')
        .select_related('user', 'category', 'category__parent')
        .prefetch_related('images')
        .order_by('-created_at')
    )
    ids = set(str(pk) for pk in request.user.wishlist.values_list('pk', flat=True))
    return JsonResponse({
        'results': [_listing_data(l) for l in listings],
        'ids':     list(ids),
    })


@login_required
def wishlist_ids(request):
    ids = list(str(pk) for pk in request.user.wishlist.values_list('pk', flat=True))
    return JsonResponse({'ids': ids})


@login_required
def my_listings(request):
    listings = (
        Listing.objects
        .filter(user=request.user, status='active')
        .prefetch_related('images')
        .order_by('-created_at')
    )
    data = []
    for l in listings:
        imgs  = list(l.images.all())
        cover = next((img for img in imgs if img.is_cover), None) or (imgs[0] if imgs else None)
        data.append({
            'id':        str(l.pk),
            'title':     l.title,
            'condition': l.condition,
            'city':      l.city,
            'image':     cover.image.url if cover else None,
        })
    return JsonResponse({'results': data})


@login_required
@require_POST
def listing_report(request, pk):
    listing = get_object_or_404(Listing, pk=pk)
    if listing.user == request.user:
        return JsonResponse({'error': 'cannot_report_own'}, status=400)

    data   = _parse(request)
    reason = data.get('reason', 'other')[:50]

    Notification.objects.create(
        user = listing.user,
        type = 'message',
        text = f'Oglas „{listing.title}" je prijavljen — razlog: {reason}',
    )
    return JsonResponse({'ok': True})


@login_required
@require_POST
def listing_start_thread(request, pk):
    listing = get_object_or_404(Listing, pk=pk)

    if listing.user == request.user:
        return JsonResponse({'error': 'cannot_message_own'}, status=400)

    conv = (
        Conversation.objects
        .filter(participants=request.user)
        .filter(participants=listing.user)
        .filter(listing=listing)
        .first()
    )
    if not conv:
        conv = Conversation.objects.create(listing=listing)
        conv.participants.add(request.user, listing.user)

    return JsonResponse({'ok': True, 'conversation_id': conv.pk})


# ─────────────────────────────────────────
#  CATEGORIES
# ─────────────────────────────────────────

def category_list(request):
    cats = Category.objects.filter(parent=None).prefetch_related('children').order_by('order', 'name')
    return JsonResponse({'results': [
        {
            'id':       c.id,
            'name':     c.name,
            'slug':     c.slug,
            'icon':     c.icon,
            'tint':     c.tint,
            'count':    c.listings.filter(status='active').count(),
            'children': [
                {
                    'id':    s.id,
                    'name':  s.name,
                    'slug':  s.slug,
                    'icon':  s.icon,
                    'count': s.listings.filter(status='active').count(),
                }
                for s in c.children.order_by('order', 'name')
            ],
        }
        for c in cats
    ]})


# ─────────────────────────────────────────
#  SWAP OFFERS
# ─────────────────────────────────────────

@login_required
@require_POST
def offer_create(request, pk):
    listing = get_object_or_404(Listing, pk=pk, status='active')

    if listing.user == request.user:
        return JsonResponse({'error': 'Ne možeš slati ponudu na sopstveni oglas.'}, status=400)

    if SwapOffer.objects.filter(listing=listing, from_user=request.user).exists():
        return JsonResponse({'error': 'already_offered'}, status=400)

    data    = _parse(request)
    message = data.get('message', '').strip()

    offered_listing = None
    if data.get('offered_listing_id'):
        offered_listing = Listing.objects.filter(
            pk=data['offered_listing_id'], user=request.user, status='active'
        ).first()

    offer = SwapOffer.objects.create(
        listing         = listing,
        from_user       = request.user,
        to_user         = listing.user,
        status          = 'pending',
        message         = message,
        offered_listing = offered_listing,
    )

    conv = (
        Conversation.objects
        .filter(participants=request.user)
        .filter(participants=listing.user)
        .filter(listing=listing)
        .first()
    )
    if not conv:
        conv = Conversation.objects.create(listing=listing)
        conv.participants.add(request.user, listing.user)

    Message.objects.create(
        conversation = conv,
        sender       = request.user,
        body         = message or f'Predlažem razmenu za oglas „{listing.title}".',
        swap_offer   = offer,
    )

    Notification.objects.create(
        user = listing.user,
        type = 'offer',
        text = f'{request.user.username} je predložio/la razmenu za tvoj oglas „{listing.title}"',
    )

    return JsonResponse({'ok': True, 'offer_id': str(offer.pk), 'conv_id': conv.pk}, status=201)


@login_required
@require_POST
def offer_respond(request, offer_id):
    offer  = get_object_or_404(SwapOffer, pk=offer_id, to_user=request.user)
    data   = _parse(request)
    action = data.get('action')

    if offer.status != 'pending':
        return JsonResponse({'error': 'Ponuda je već obrađena.'}, status=400)

    if action == 'accept':
        offer.status         = 'accepted'
        offer.listing.status = 'reserved'
        offer.listing.save()
        SwapOffer.objects.filter(
            listing=offer.listing,
            status='pending',
        ).exclude(pk=offer.pk).update(status='declined')
        Notification.objects.create(
            user = offer.from_user,
            type = 'offer_accepted',
            text = f'{request.user.username} je prihvatio/la tvoju ponudu za „{offer.listing.title}"',
        )
    elif action == 'decline':
        offer.status = 'declined'
        Notification.objects.create(
            user = offer.from_user,
            type = 'offer_declined',
            text = f'{request.user.username} je odbio/la tvoju ponudu za „{offer.listing.title}"',
        )
    else:
        return JsonResponse({'error': 'Nevažeća akcija.'}, status=400)

    offer.save()
    return JsonResponse({'ok': True, 'status': offer.status})


# ─────────────────────────────────────────
#  INBOX / CHAT
# ─────────────────────────────────────────

@login_required
def inbox(request):
    convs = (
        Conversation.objects
        .filter(participants=request.user)
        .prefetch_related('participants', 'messages', 'messages__sender', 'messages__swap_offer')
        .select_related('listing')
        .order_by('-updated_at')
    )

    data = []
    for conv in convs:
        msgs     = list(conv.messages.all())
        last_msg = msgs[-1] if msgs else None
        other    = conv.participants.exclude(pk=request.user.pk).first()
        unread   = sum(1 for m in msgs if not m.is_read and m.sender_id != request.user.pk)
        offer_id = None
        first_with_offer = next((m for m in msgs if m.swap_offer_id), None)
        if first_with_offer:
            offer_id = str(first_with_offer.swap_offer_id)

        data.append({
            'id':           conv.pk,
            'other_user':   {'username': other.username} if other else None,
            'listing':      {'id': str(conv.listing.pk), 'title': conv.listing.title} if conv.listing else None,
            'last_message': last_msg.body if last_msg else '',
            'last_time':    last_msg.created_at.isoformat() if last_msg else None,
            'unread':       unread > 0,
            'offer_id':     offer_id,
        })

    return JsonResponse({'results': data})


@login_required
def chat(request, conversation_id):
    conv = get_object_or_404(Conversation, pk=conversation_id)

    if not conv.participants.filter(pk=request.user.pk).exists():
        return JsonResponse({'error': 'Zabranjen pristup.'}, status=403)

    if request.method == 'POST':
        data = _parse(request)
        body = data.get('body', '').strip()
        if not body:
            return JsonResponse({'error': 'Poruka ne može biti prazna.'}, status=400)

        msg = Message.objects.create(conversation=conv, sender=request.user, body=body)
        conv.save()

        other = conv.participants.exclude(pk=request.user.pk).first()
        if other:
            Notification.objects.create(
                user = other,
                type = 'message',
                text = f'{request.user.username} ti je poslao/la poruku',
            )
        return JsonResponse({'ok': True, 'message': _msg_data(msg, is_first=False)}, status=201)

    msgs = list(
        conv.messages
        .select_related('sender', 'swap_offer', 'swap_offer__offered_listing', 'swap_offer__listing')
        .all()
    )
    conv.messages.filter(is_read=False).exclude(sender=request.user).update(is_read=True)
    return JsonResponse({
        'results': [_msg_data(m, is_first=(i == 0)) for i, m in enumerate(msgs)]
    })


# ─────────────────────────────────────────
#  NOTIFICATIONS
# ─────────────────────────────────────────

@login_required
def notifications_view(request):
    notifs = request.user.notifications.all()[:50]
    return JsonResponse({'ok': True, 'results': [_notif_data(n) for n in notifs]})


@login_required
@require_POST
def notifications_mark_read(request):
    request.user.notifications.filter(is_read=False).update(is_read=True)
    return JsonResponse({'ok': True})


# ─────────────────────────────────────────
#  PROFILE
# ─────────────────────────────────────────

@login_required
def profile(request):
    if request.method == 'PUT':
        data = _parse(request)
        for field in ('bio', 'city'):
            if field in data:
                setattr(request.user, field, data[field])
        request.user.save()
        return JsonResponse({'ok': True, 'user': _user_data(request.user)})

    listings = Listing.objects.filter(user=request.user).order_by('-created_at')
    return JsonResponse({
        'user':     _user_data(request.user),
        'listings': [_listing_data(l) for l in listings],
    })


def profile_user(request, username):
    user = get_object_or_404(User, username=username)
    listings = (
        Listing.objects
        .filter(user=user, status='active')
        .prefetch_related('images')
        .order_by('-created_at')
    )
    reviews = (
        Review.objects
        .filter(to_user=user)
        .select_related('from_user')
        .order_by('-created_at')[:20]
    )
    return JsonResponse({
        'user':     _user_data(user),
        'listings': [_listing_data(l) for l in listings],
        'reviews':  [_review_data(r) for r in reviews],
    })


# ─────────────────────────────────────────
#  HELPERS
# ─────────────────────────────────────────

def _parse(request):
    try:
        return json.loads(request.body)
    except (json.JSONDecodeError, AttributeError):
        return request.POST.dict()


def _user_data(user):
    return {
        'id':           user.pk,
        'username':     user.username,
        'email':        user.email,
        'first_name':   user.first_name,
        'last_name':    user.last_name,
        'bio':          user.bio,
        'city':         user.city,
        'is_verified':  user.is_verified,
        'rating':       float(user.rating),
        'rating_count': user.rating_count,
        'joined':       user.date_joined.isoformat(),
    }


def _listing_data(listing, full=False):
    all_images = list(listing.images.all())
    cover      = next((img for img in all_images if img.is_cover), None) or (all_images[0] if all_images else None)

    cat = listing.category
    category_data = None
    if cat:
        category_data = {
            'name':        cat.name,
            'slug':        cat.slug,
            'parent_name': cat.parent.name if cat.parent else None,
            'parent_slug': cat.parent.slug if cat.parent else None,
        }

    data = {
        'id':                str(listing.pk),
        'title':             listing.title,
        'price':             float(listing.price) if listing.price else None,
        'listing_type':      listing.listing_type,
        'condition':         listing.condition,
        'status':            listing.status,
        'city':              listing.city,
        'views':             listing.views,
        'created_at':        listing.created_at.isoformat(),
        'wants_in_exchange': listing.wants_in_exchange,
        'user': {
            'username': listing.user.username,
            'rating':   float(listing.user.rating),
        },
        'category': category_data,
        'images':   [{'url': cover.image.url, 'is_cover': True}] if cover else [],
    }

    if full:
        data['description'] = listing.description
        data['images']      = [{'url': img.image.url, 'is_cover': img.is_cover} for img in all_images]
        data['user']        = _user_data(listing.user)

    return data


def _msg_data(msg, is_first=False):
    offer_data = None
    if msg.swap_offer_id:
        offer = msg.swap_offer
        offer_data = {
            'id':              str(offer.pk),
            'status':          offer.status,
            'offered_listing': _mini_listing(offer.offered_listing),
            'target_listing':  _mini_listing(offer.listing),
        }
    return {
        'id':         msg.pk,
        'sender':     msg.sender.username,
        'body':       msg.body,
        'is_read':    msg.is_read,
        'created_at': msg.created_at.isoformat(),
        'offer':      offer_data,
    }


def _mini_listing(listing):
    if not listing:
        return None
    imgs  = list(listing.images.all())
    cover = next((img for img in imgs if img.is_cover), None) or (imgs[0] if imgs else None)
    return {
        'id':        str(listing.pk),
        'title':     listing.title,
        'image':     cover.image.url if cover else None,
        'condition': listing.condition,
        'city':      listing.city,
    }


def _notif_data(n):
    return {
        'id':         n.pk,
        'type':       n.type,
        'text':       n.text,
        'is_read':    n.is_read,
        'created_at': n.created_at.isoformat(),
    }


def _review_data(review):
    return {
        'id':         review.pk,
        'from_user':  review.from_user.username,
        'rating':     review.rating,
        'comment':    review.comment,
        'created_at': review.created_at.isoformat(),
    }