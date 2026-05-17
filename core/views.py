from django.shortcuts import render, get_object_or_404
from django.contrib.auth import authenticate, login, logout, get_user_model
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_POST, require_http_methods
from django.db.models import Q, F, Avg, Count
from django.core.paginator import Paginator
from django.shortcuts import redirect
from django_ratelimit.decorators import ratelimit
import json
import uuid
import re
import dns.resolver

from .models import Listing, ListingImage, Category, SwapOffer, Conversation, Message, Notification, Review, Report
from . import emails as email_service

User = get_user_model()

VALID_LISTING_TYPES = {'sell', 'barter', 'both'}
VALID_CONDITIONS    = {'new', 'like_new', 'good', 'fair', 'poor', 'antique'}

_EMAIL_RE = re.compile(r'^[^@\s]+@[^@\s]+\.[^@\s]+$')

def _email_domain_valid(email):
    if not _EMAIL_RE.match(email):
        return False
    domain = email.rsplit('@', 1)[1]
    try:
        dns.resolver.resolve(domain, 'MX', lifetime=5)
        return True
    except Exception:
        try:
            dns.resolver.resolve(domain, 'A', lifetime=5)
            return True
        except Exception:
            return False


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


@ratelimit(key='ip', rate='5/h', method='POST', block=True)
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
    elif not _email_domain_valid(email):
        errors['email'] = ['Email adresa nije validna ili domen ne postoji.']
    elif User.objects.filter(email=email).exists():
        errors['email'] = ['Email je već registrovan.']
    if len(password) < 8:
        errors['password'] = ['Lozinka mora imati najmanje 8 karaktera.']

    if errors:
        return JsonResponse(errors, status=400)

    user = User.objects.create_user(username=username, email=email, password=password)
    user.email_verification_token = uuid.uuid4()
    user.save()
    email_service.send_verification_email(user)
    login(request, user)
    return JsonResponse({'user': _user_data(user)}, status=201)


@ratelimit(key='ip', rate='10/m', method='POST', block=True)
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
        qs = qs.filter(Q(title__icontains=q) | Q(description__icontains=q) | Q(wants_in_exchange__icontains=q))
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

    if request.GET.get('premium') == '1':
        qs = qs.filter(is_premium=True)

    conditions = [c for c in request.GET.get('condition', '').split(',') if c]
    if conditions:
        qs = qs.filter(condition__in=conditions)

    max_price = request.GET.get('max_price', '')
    if max_price:
        try:
            qs = qs.filter(Q(price__lte=float(max_price)) | Q(price__isnull=True))
        except ValueError:
            pass

    if request.GET.get('search_mode') == 'offer':
        if q:
            qs = qs.filter(wants_in_exchange__icontains=q)

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
        .prefetch_related('images')
        .annotate(saves=Count('wishlisted_by')),
        pk=pk,
    )
    if not request.user.is_authenticated or request.user.pk != listing.user_id:
        Listing.objects.filter(pk=pk).update(views=F('views') + 1)
    is_owner = request.user.is_authenticated and request.user.pk == listing.user_id
    return JsonResponse(_listing_data(listing, full=True, show_saves=is_owner))


@login_required
@require_http_methods(['POST'])
def listing_create(request):
    try:
        data      = _parse(request)
        ltype     = data.get('listing_type', 'both')
        condition = data.get('condition', 'good')

        if ltype not in VALID_LISTING_TYPES:
            return JsonResponse({'error': 'Nevažeći tip oglasa.'}, status=400)
        if condition not in VALID_CONDITIONS:
            return JsonResponse({'error': 'Nevažeće stanje predmeta.'}, status=400)

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
            condition         = condition,
            city              = data.get('city', '').strip(),
            wants_in_exchange = data.get('wants_in_exchange', '').strip(),
        )
        return JsonResponse({'ok': True, 'listing': _listing_data(listing, full=True)}, status=201)
    except Exception as e:
        import traceback
        return JsonResponse({'ok': False, 'error': str(e), 'detail': traceback.format_exc()}, status=500)


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
        if data['listing_type'] not in VALID_LISTING_TYPES:
            return JsonResponse({'error': 'Nevažeći tip oglasa.'}, status=400)
        listing.listing_type = data['listing_type']

    if 'condition' in data and data['condition'] not in VALID_CONDITIONS:
        return JsonResponse({'error': 'Nevažeće stanje predmeta.'}, status=400)

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
        .annotate(saves=Count('wishlisted_by'))
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
            'views':     l.views,
            'saves':     l.saves,
            'image':     cover.image.url if cover else None,
        })
    return JsonResponse({'results': data})


@ratelimit(key='user', rate='5/h', method='POST', block=True)
@login_required
@require_POST
def listing_report(request, pk):
    listing = get_object_or_404(Listing, pk=pk)
    if listing.user == request.user:
        return JsonResponse({'error': 'cannot_report_own'}, status=400)

    data    = _parse(request)
    reason  = data.get('reason', 'other')[:20]
    details = data.get('details', '').strip()[:500]

    report, created = Report.objects.get_or_create(
        listing  = listing,
        reporter = request.user,
        defaults = {'reason': reason, 'details': details},
    )
    if not created:
        return JsonResponse({'error': 'already_reported'}, status=400)

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
    # One query: count active listings per subcategory
    sub_counts = dict(
        Category.objects.filter(parent__isnull=False)
        .annotate(n=Count('listings', filter=Q(listings__status='active')))
        .values_list('id', 'n')
    )

    cats = Category.objects.filter(parent=None).prefetch_related('children').order_by('order', 'name')

    return JsonResponse({'results': [
        {
            'id':       c.id,
            'name':     c.name,
            'slug':     c.slug,
            'icon':     c.icon,
            'tint':     c.tint,
            'count':    sum(sub_counts.get(s.id, 0) for s in c.children.all()),
            'children': [
                {
                    'id':    s.id,
                    'name':  s.name,
                    'slug':  s.slug,
                    'icon':  s.icon,
                    'count': sub_counts.get(s.id, 0),
                }
                for s in c.children.order_by('order', 'name')
            ],
        }
        for c in cats
    ]})


# ─────────────────────────────────────────
#  SWAP OFFERS
# ─────────────────────────────────────────

@ratelimit(key='user', rate='10/h', method='POST', block=True)
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

    cash_offer = None
    try:
        raw = data.get('cash_offer')
        if raw not in (None, '', 0, '0'):
            cash_offer = float(raw)
            if cash_offer <= 0:
                cash_offer = None
    except (TypeError, ValueError):
        pass

    offer = SwapOffer.objects.create(
        listing         = listing,
        from_user       = request.user,
        to_user         = listing.user,
        status          = 'pending',
        message         = message,
        offered_listing = offered_listing,
        cash_offer      = cash_offer,
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
    email_service.send_new_offer(
        to_user       = listing.user,
        from_username = request.user.username,
        listing_title = listing.title,
        offered_title = offered_listing.title if offered_listing else None,
        cash_offer    = cash_offer,
        message       = message,
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
        email_service.send_offer_accepted(
            to_user       = offer.from_user,
            by_username   = request.user.username,
            listing_title = offer.listing.title,
        )
    elif action == 'decline':
        offer.status = 'declined'
        Notification.objects.create(
            user = offer.from_user,
            type = 'offer_declined',
            text = f'{request.user.username} je odbio/la tvoju ponudu za „{offer.listing.title}"',
        )
        email_service.send_offer_declined(
            to_user       = offer.from_user,
            by_username   = request.user.username,
            listing_title = offer.listing.title,
        )
    else:
        return JsonResponse({'error': 'Nevažeća akcija.'}, status=400)

    offer.save()
    return JsonResponse({'ok': True, 'status': offer.status})


@login_required
def my_offers(request):
    qs = (
        SwapOffer.objects
        .filter(Q(from_user=request.user) | Q(to_user=request.user))
        .select_related('listing', 'from_user', 'to_user', 'offered_listing')
        .prefetch_related('listing__images', 'offered_listing__images')
        .order_by('-created_at')
    )
    offer_list = list(qs)
    reviewed_ids = set(
        Review.objects
        .filter(swap_offer_id__in=[o.pk for o in offer_list], from_user=request.user)
        .values_list('swap_offer_id', flat=True)
    )
    result = []
    for offer in offer_list:
        is_sender    = offer.from_user_id == request.user.pk
        i_reviewed   = offer.pk in reviewed_ids
        i_confirmed  = offer.completed_by_from if is_sender else offer.completed_by_to
        can_complete = offer.status == 'accepted' and not i_confirmed
        result.append({
            'id':                str(offer.pk),
            'status':            offer.status,
            'is_sender':         is_sender,
            'other_user':        offer.to_user.username if is_sender else offer.from_user.username,
            'listing':           _mini_listing(offer.listing),
            'offered_listing':   _mini_listing(offer.offered_listing),
            'message':           offer.message,
            'created_at':        offer.created_at.isoformat(),
            'completed_by_from': offer.completed_by_from,
            'completed_by_to':   offer.completed_by_to,
            'cash_offer':        float(offer.cash_offer) if offer.cash_offer else None,
            'i_confirmed':       i_confirmed,
            'can_complete':      can_complete,
            'can_review':        offer.status == 'completed' and not i_reviewed,
            'i_reviewed':        i_reviewed,
        })
    return JsonResponse({'results': result})


@login_required
@require_POST
def offer_complete(request, offer_id):
    offer = get_object_or_404(SwapOffer, pk=offer_id)
    if request.user.pk not in (offer.from_user_id, offer.to_user_id):
        return JsonResponse({'error': 'Zabranjen pristup.'}, status=403)
    if offer.status != 'accepted':
        return JsonResponse({'error': 'Ponuda mora biti prihvaćena da bi se završila.'}, status=400)

    is_from = request.user.pk == offer.from_user_id
    if is_from:
        if offer.completed_by_from:
            return JsonResponse({'error': 'Već si potvrdio/la.'}, status=400)
        offer.completed_by_from = True
    else:
        if offer.completed_by_to:
            return JsonResponse({'error': 'Već si potvrdio/la.'}, status=400)
        offer.completed_by_to = True

    both_confirmed = offer.completed_by_from and offer.completed_by_to
    if both_confirmed:
        offer.status = 'completed'
        offer.listing.status = 'closed'
        offer.listing.save()
        if offer.offered_listing:
            offer.offered_listing.status = 'closed'
            offer.offered_listing.save()

    offer.save()

    other = offer.to_user if is_from else offer.from_user
    if both_confirmed:
        Notification.objects.create(
            user = other,
            type = 'offer_accepted',
            text = f'Razmena za „{offer.listing.title}" je završena! Ostavi ocenu.',
        )
        email_service.send_swap_completed(
            to_user        = other,
            other_username = request.user.username,
            listing_title  = offer.listing.title,
        )
        # also notify the confirming user themselves
        email_service.send_swap_completed(
            to_user        = request.user,
            other_username = other.username,
            listing_title  = offer.listing.title,
        )
    else:
        Notification.objects.create(
            user = other,
            type = 'offer_accepted',
            text = f'{request.user.username} je potvrdio/la razmenu za „{offer.listing.title}" — čeka se tvoja potvrda.',
        )
        email_service.send_swap_waiting_confirm(
            to_user       = other,
            from_username = request.user.username,
            listing_title = offer.listing.title,
        )

    return JsonResponse({'ok': True, 'status': offer.status, 'both_confirmed': both_confirmed})


@login_required
@require_POST
def offer_review(request, offer_id):
    offer = get_object_or_404(SwapOffer, pk=offer_id, status='completed')
    if request.user.pk not in (offer.from_user_id, offer.to_user_id):
        return JsonResponse({'error': 'Zabranjen pristup.'}, status=403)
    if Review.objects.filter(swap_offer=offer, from_user=request.user).exists():
        return JsonResponse({'error': 'Već si ostavio/la ocenu za ovu razmenu.'}, status=400)

    data    = _parse(request)
    rating  = int(data.get('rating', 0))
    comment = data.get('comment', '').strip()

    if not (1 <= rating <= 5):
        return JsonResponse({'error': 'Ocena mora biti između 1 i 5.'}, status=400)

    to_user = offer.to_user if request.user == offer.from_user else offer.from_user
    Review.objects.create(
        from_user  = request.user,
        to_user    = to_user,
        swap_offer = offer,
        rating     = rating,
        comment    = comment,
    )

    result = Review.objects.filter(to_user=to_user).aggregate(avg=Avg('rating'), count=Count('id'))
    to_user.rating       = round(result['avg'] or 0, 2)
    to_user.rating_count = result['count']
    to_user.save()

    Notification.objects.create(
        user = to_user,
        type = 'review',
        text = f'{request.user.username} ti je ostavio/la ocenu {rating}★ za razmenu „{offer.listing.title}"',
    )
    return JsonResponse({'ok': True})


@login_required
def my_reviews(request):
    reviews = (
        Review.objects
        .filter(to_user=request.user)
        .select_related('from_user', 'swap_offer', 'swap_offer__listing')
        .order_by('-created_at')
    )
    return JsonResponse({'results': [
        {
            'id':         r.pk,
            'from_user':  r.from_user.username,
            'rating':     r.rating,
            'comment':    r.comment,
            'listing':    r.swap_offer.listing.title if r.swap_offer and r.swap_offer.listing else '',
            'created_at': r.created_at.isoformat(),
        }
        for r in reviews
    ]})


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


@ratelimit(key='user', rate='30/m', method='POST', block=True)
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
            # send email only if other has unread messages (i.e. they're not actively chatting)
            unread_count = conv.messages.filter(is_read=False).exclude(sender=request.user).count()
            if unread_count <= 1:
                listing_title = conv.listing.title if conv.listing else None
                email_service.send_new_message(
                    to_user       = other,
                    from_username = request.user.username,
                    listing_title = listing_title,
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
        for field in ('bio', 'city', 'phone'):
            if field in data:
                setattr(request.user, field, data[field])
        request.user.save()
        return JsonResponse({'ok': True, 'user': _user_data(request.user)})

    listings = Listing.objects.filter(user=request.user).order_by('-created_at')
    return JsonResponse({
        'user':     _user_data(request.user),
        'listings': [_listing_data(l) for l in listings],
    })


@login_required
@require_POST
def profile_avatar(request):
    img = request.FILES.get('avatar')
    if not img:
        return JsonResponse({'error': 'Nema slike.'}, status=400)
    if img.size > 5 * 1024 * 1024:
        return JsonResponse({'error': 'Slika ne sme biti veća od 5 MB.'}, status=400)
    request.user.avatar = img
    request.user.save()
    return JsonResponse({'ok': True, 'avatar': request.user.avatar.url})


@login_required
@require_POST
def change_password(request):
    data         = _parse(request)
    old_password = data.get('old_password', '')
    new_password = data.get('new_password', '')

    if not request.user.check_password(old_password):
        return JsonResponse({'error': 'Pogrešna trenutna lozinka.'}, status=400)
    if len(new_password) < 8:
        return JsonResponse({'error': 'Nova lozinka mora imati najmanje 8 karaktera.'}, status=400)

    request.user.set_password(new_password)
    request.user.save()
    # keep session alive after password change
    from django.contrib.auth import update_session_auth_hash
    update_session_auth_hash(request, request.user)
    return JsonResponse({'ok': True})


def verify_email(request, token):
    user = User.objects.filter(email_verification_token=token, is_verified=False).first()
    if not user:
        return redirect('/?verified=invalid')
    user.is_verified = True
    user.email_verification_token = None
    user.save()
    return redirect('/?verified=1')


@login_required
@require_POST
def resend_verification(request):
    if request.user.is_verified:
        return JsonResponse({'error': 'Nalog je već verifikovan.'}, status=400)
    request.user.email_verification_token = uuid.uuid4()
    request.user.save()
    email_service.send_verification_email(request.user)
    return JsonResponse({'ok': True})


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
    data = _user_data(user)
    if not request.user.is_authenticated:
        data['phone'] = None
    return JsonResponse({
        'user':     data,
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
        'phone':        user.phone,
        'avatar':       user.avatar.url if user.avatar else None,
        'is_verified':  user.is_verified,
        'rating':       float(user.rating),
        'rating_count': user.rating_count,
        'joined':       user.date_joined.isoformat(),
        'has_phone':    bool(user.phone),
    }


def _listing_data(listing, full=False, show_saves=False):
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
        'saves':             getattr(listing, 'saves', None) if show_saves else None,
        'is_featured':       listing.is_featured,
        'is_premium':        listing.is_premium,
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
            'id':                str(offer.pk),
            'status':            offer.status,
            'from_user_id':      offer.from_user_id,
            'to_user_id':        offer.to_user_id,
            'completed_by_from': offer.completed_by_from,
            'completed_by_to':   offer.completed_by_to,
            'cash_offer':        float(offer.cash_offer) if offer.cash_offer else None,
            'offered_listing':   _mini_listing(offer.offered_listing),
            'target_listing':    _mini_listing(offer.listing),
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