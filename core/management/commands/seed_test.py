import io
import json
import os
import random
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from datetime import timedelta

from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand
from django.utils import timezone

from PIL import Image, ImageDraw

from core.models import User, Category, Listing, ListingImage
from core.management.commands.seed import CATEGORIES


# 15 test users — realistic Serbian names spread across cities.
USERS = [
    {'username': 'marko_petrovic',   'first': 'Marko',    'last': 'Petrović',   'city': 'Beograd'},
    {'username': 'ana_jovanovic',    'first': 'Ana',      'last': 'Jovanović',  'city': 'Novi Sad'},
    {'username': 'stefan_nikolic',   'first': 'Stefan',   'last': 'Nikolić',    'city': 'Kragujevac'},
    {'username': 'jelena_ilic',      'first': 'Jelena',   'last': 'Ilić',       'city': 'Niš'},
    {'username': 'nikola_kovacevic', 'first': 'Nikola',   'last': 'Kovačević',  'city': 'Subotica'},
    {'username': 'milica_djordjevic','first': 'Milica',   'last': 'Đorđević',   'city': 'Beograd'},
    {'username': 'luka_stojanovic',  'first': 'Luka',     'last': 'Stojanović', 'city': 'Novi Sad'},
    {'username': 'sara_markovic',    'first': 'Sara',     'last': 'Marković',   'city': 'Čačak'},
    {'username': 'filip_pavlovic',   'first': 'Filip',    'last': 'Pavlović',   'city': 'Pančevo'},
    {'username': 'teodora_lukic',    'first': 'Teodora',  'last': 'Lukić',      'city': 'Zrenjanin'},
    {'username': 'aleksa_ristic',    'first': 'Aleksa',   'last': 'Ristić',     'city': 'Leskovac'},
    {'username': 'katarina_simic',   'first': 'Katarina', 'last': 'Simić',      'city': 'Kraljevo'},
    {'username': 'vuk_milosevic',    'first': 'Vuk',      'last': 'Milošević',  'city': 'Smederevo'},
    {'username': 'masa_todorovic',   'first': 'Maša',     'last': 'Todorović',  'city': 'Valjevo'},
    {'username': 'pavle_jankovic',   'first': 'Pavle',    'last': 'Janković',   'city': 'Šabac'},
]

# (cat_slug, title, price, type, condition, wants, image_keyword)
# image_keyword drives the real photo lookup (LoremFlickr / Picsum).
LISTING_POOL = [
    ('elektronika', 'iPhone 13 Pro 256GB grafitni',        65000, 'both',   'like_new', 'MacBook ili sličan laptop',         'iphone'),
    ('elektronika', 'MacBook Air M1 2021 srebrni',          95000, 'sell',   'good',     '',                                  'macbook,laptop'),
    ('elektronika', 'Sony WH-1000XM5 slušalice',            28000, 'barter', 'like_new', 'Mehanička tastatura ili gaming miš','headphones'),
    ('elektronika', 'Samsung 65" QLED 4K televizor',        78000, 'both',   'like_new', 'Projektor ili manji TV',            'television'),
    ('elektronika', 'GoPro Hero 11 Black',                  42000, 'both',   'like_new', 'Stabilizator ili dron',             'gopro,camera'),
    ('elektronika', 'PlayStation 5 Slim + 2 kontrolera',    72000, 'sell',   'good',     '',                                  'playstation,console'),
    ('dom',         'Ugaona sofa siva 3+2',                 45000, 'sell',   'good',     '',                                  'sofa,couch'),
    ('dom',         'Trpezarijski sto hrast 6 mesta',       30000, 'both',   'good',     'Manji sto ili stolice',             'dining-table'),
    ('dom',         'LED luster moderni dnevna soba',        8500, 'barter', 'like_new', 'Podna lampa',                       'chandelier,lamp'),
    ('dom',         'Garderober klizna vrata bele',         38000, 'sell',   'good',     '',                                  'wardrobe,closet'),
    ('bela-tehnika','Frižider Beko No Frost A++',           42000, 'both',   'good',     'Manji frižider ili zamrzivač',      'refrigerator'),
    ('bela-tehnika','Veš mašina Gorenje 7kg',               35000, 'sell',   'good',     '',                                  'washing-machine'),
    ('bela-tehnika','Klima Vivax 12 inverter',              28000, 'both',   'like_new', 'Grejalica ili ventilator',          'air-conditioner'),
    ('alati',       'Bosch akumulatorska bušilica set',     12000, 'both',   'like_new', 'Ugaona brusilica',                  'drill,tools'),
    ('alati',       'Stihl motorna testera MS 180',         28000, 'sell',   'good',     '',                                  'chainsaw'),
    ('alati',       'Agregat benzinski 2.5kW',              22000, 'both',   'good',     'Kompresor ili varilica',            'generator'),
    ('vozila',      'Bicikl MTB 27.5" Kellys',              35000, 'both',   'good',     'Električni trotinet ili longboard', 'mountain-bike'),
    ('vozila',      'Skuter Piaggio Zip 50',                95000, 'sell',   'good',     '',                                  'scooter'),
    ('vozila',      'Set zimskih guma 205/55 R16',          18000, 'both',   'good',     'Letnje gume iste veličine',         'car-tire'),
    ('vozila',      'Krovni nosač Thule univerzalni',        9500, 'barter', 'like_new', 'Kuka za vuču',                      'roof-rack,car'),
    ('moda',        'Zimska jakna North Face XL',             8500, 'barter', 'good',     'Letnja jakna ili ranac',            'winter-jacket'),
    ('moda',        'Nike Air Max 270 br. 43',                6000, 'both',   'like_new', 'Jordan ili Adidas br. 43',          'sneakers'),
    ('moda',        'Patagonia ranac 30L crni',               7500, 'sell',   'good',     '',                                  'backpack'),
    ('moda',        'Ručni sat Casio G-Shock',                9000, 'both',   'good',     'Drugi sat ili sunčane naočare',     'wristwatch'),
    ('lepota',      'Dyson Airwrap komplet',                 38000, 'sell',   'like_new', '',                                  'hair-dryer'),
    ('lepota',      'Set parfema muški 3x100ml',              7000, 'barter', 'new',      'Ženski parfem',                     'perfume'),
    ('sport',       'Bicikl sobni magnetni',                 14000, 'both',   'good',     'Tegovi ili traka za trčanje',       'exercise-bike'),
    ('sport',       'Tegovi set 2×10kg + šipka',              5500, 'barter', 'good',     'Kettlebell ili gume za vežbanje',   'dumbbell,gym'),
    ('sport',       'Šator za 4 osobe Quechua',              11000, 'both',   'good',     'Spavaća vreća ili ranac',           'tent,camping'),
    ('sport',       'Skije Atomic 170cm + štapovi',          16000, 'sell',   'good',     '',                                  'ski'),
    ('hobi',        'Fender Stratocaster MIM sunburst',      55000, 'both',   'good',     'Les Paul ili Telecaster',           'electric-guitar'),
    ('hobi',        'Roland elektronski klavir FP-30X',      48000, 'sell',   'like_new', '',                                  'piano,keyboard'),
    ('hobi',        'Komplet knjiga — Tolkien',               2500, 'barter', 'good',     'Naučna fantastika ili fantasy',     'books'),
    ('hobi',        'Gramofon Audio-Technica LP120',         32000, 'both',   'like_new', 'Pojačalo ili zvučnici',             'turntable,vinyl'),
    ('deca',        'Kolica Cybex 3u1',                      28000, 'both',   'good',     'Auto-sedište grupa 1',              'baby-stroller'),
    ('deca',        'Drveni krevetac sa dušekom',            12000, 'sell',   'good',     '',                                  'baby-crib'),
    ('deca',        'Set edukativnih igračaka Montessori',    4500, 'barter', 'like_new', 'Lego set',                          'wooden-toys'),
    ('ljubimci',    'Transporter za mačke/pse M',             3500, 'barter', 'good',     'Oprema za akvarijum',               'pet-carrier'),
    ('ljubimci',    'Akvarijum 100L sa opremom',             15000, 'both',   'good',     'Terarijum',                         'aquarium'),
    ('basta',       'Baštenska garnitura ratan 4 dela',      32000, 'sell',   'good',     '',                                  'garden-furniture'),
    ('basta',       'Kosilica benzinska Honda',              35000, 'both',   'good',     'Trimer ili duvač',                  'lawn-mower'),
    ('basta',       'Roštilj na ugalj Weber',                14000, 'barter', 'like_new', 'Električni roštilj',                'bbq-grill'),
    ('posao-oprema','Kancelarijska stolica ergonomska',      11000, 'both',   'good',     'Stojeći sto',                       'office-chair'),
    ('nekretnine',  'Garaža 15m² centar grada',             900000, 'sell',   'good',     '',                                  'garage'),
    ('hrana',       'Domaći med bagrem 5kg',                  4500, 'both',   'new',      'Rakija ili sir',                    'honey'),
]

DESCRIPTIONS = [
    'Odlično očuvano, malo korišćeno. Sve ispravno radi. Ozbiljne ponude. Moguća zamena uz dogovor.',
    'Kupljeno pre godinu dana, bez ikakvih oštećenja. Šaljem širom Srbije, lično preuzimanje u gradu.',
    'Kao novo, čuvano i održavano. Dostupno odmah. Cena fiksna, zamena samo za navedeno.',
    'Polovno ali u top stanju, vidi se na slikama. Brza isporuka, dogovor oko cene moguć.',
    'Stanje besprekorno, original kutija i papiri. Prednost ozbiljnim kupcima i bržem dogovoru.',
]

IMG_COLORS = [
    (13, 110, 111), (184, 89, 10), (28, 124, 84),
    (60, 71, 68), (107, 118, 114), (155, 100, 60),
]


def _placeholder(title, idx):
    """Last-resort solid-color image with the title drawn on it."""
    color = IMG_COLORS[idx % len(IMG_COLORS)]
    img = Image.new('RGB', (800, 600), color)
    draw = ImageDraw.Draw(img)
    short = (title[:34] + '…') if len(title) > 35 else title
    draw.text((40, 280), short, fill=(255, 255, 255))
    buf = io.BytesIO()
    img.save(buf, format='JPEG', quality=72)
    return buf.getvalue()


def _download(url, timeout=15):
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        data = r.read()
    if not data or len(data) < 2000:
        raise ValueError('response too small')
    # Validate it really is an image Pillow can read.
    Image.open(io.BytesIO(data)).verify()
    return data


def _pexels_search(keyword, api_key, want=3, timeout=15):
    """Search Pexels by keyword; return a list of image URLs (most relevant
    first). Empty list on any failure."""
    # Pexels matches single terms best; drop the comma-separated synonyms.
    term = keyword.split(',')[0].replace('-', ' ').strip()
    q = urllib.parse.quote(term)
    url = (f'https://api.pexels.com/v1/search?query={q}'
           f'&per_page={max(want, 6)}&orientation=landscape')
    req = urllib.request.Request(url, headers={
        'Authorization': api_key,
        'User-Agent': 'Mozilla/5.0',
    })
    with urllib.request.urlopen(req, timeout=timeout) as r:
        payload = json.loads(r.read().decode('utf-8'))
    urls = []
    for photo in payload.get('photos', []):
        src = photo.get('src', {})
        u = src.get('large') or src.get('medium') or src.get('original')
        if u:
            urls.append(u)
    return urls


class Command(BaseCommand):
    help = '15 test korisnika, svaki sa po 3 oglasa (razne kategorije) i po 3 prave slike.'

    def add_arguments(self, parser):
        parser.add_argument('--clear', action='store_true',
                            help='Obriši ranije test korisnike (i njihove oglase) pre seedovanja.')

    def handle(self, *args, **options):
        rng = random.Random(42)

        if options['clear']:
            usernames = [u['username'] for u in USERS]
            Listing.objects.filter(user__username__in=usernames).delete()
            User.objects.filter(username__in=usernames).delete()
            self.stdout.write(self.style.WARNING('Raniji test podaci obrisani.'))

        # ── Kategorije moraju postojati ────────────────────
        main_cats = {}
        for order, c in enumerate(CATEGORIES):
            parent, _ = Category.objects.get_or_create(
                slug=c['id'],
                defaults={'name': c['name'], 'icon': c['icon'], 'tint': c['tint'], 'order': order},
            )
            main_cats[c['id']] = parent

        # ── Korisnici ──────────────────────────────────────
        users = []
        for u in USERS:
            obj, created = User.objects.get_or_create(
                username=u['username'],
                defaults={
                    'email':        f"{u['username']}@test.dajzameni.rs",
                    'first_name':   u['first'],
                    'last_name':    u['last'],
                    'city':         u['city'],
                    'phone':        '',
                    'is_verified':  True,
                    'rating':       round(rng.uniform(3.6, 5.0), 2),
                    'rating_count': rng.randint(3, 45),
                },
            )
            if created:
                obj.set_password('test1234')
                obj.save()
            users.append(obj)

        # ── Oglasi: 3 po korisniku, iz različitih kategorija ─
        by_cat = {}
        for item in LISTING_POOL:
            by_cat.setdefault(item[0], []).append(item)

        created_listings = []   # (listing, keyword)
        cat_increments = {}

        for user in users:
            chosen_cats = rng.sample(list(by_cat.keys()), 3)
            for cat_slug in chosen_cats:
                template = rng.choice(by_cat[cat_slug])
                _, title, price, ltype, condition, wants, keyword = template
                cat = main_cats.get(cat_slug)

                unique_title = f'{title} — {user.first_name}'
                if Listing.objects.filter(title=unique_title, user=user).exists():
                    continue

                listing = Listing.objects.create(
                    user=user,
                    category=cat,
                    title=unique_title,
                    description=rng.choice(DESCRIPTIONS),
                    price=price,
                    listing_type=ltype,
                    condition=condition,
                    status='active',
                    city=user.city,
                    wants_in_exchange=wants,
                    views=rng.randint(8, 420),
                    is_premium=rng.random() < 0.15,
                    is_featured=rng.random() < 0.1,
                    expires_at=timezone.now() + timedelta(days=Listing.TTL_DAYS),
                )
                created_listings.append((listing, keyword))
                cat_increments[cat_slug] = cat_increments.get(cat_slug, 0) + 1

        # ── Preuzmi prave fotografije sa Pexels-a ──────────
        # Jedan search po oglasu (≈45 ukupno, ispod limita 200/h), svaki
        # vrati do 3 relevantne fotografije baš za taj predmet.
        api_key = os.environ.get('PEXELS_API_KEY', '').strip()
        if not api_key:
            self.stderr.write(self.style.WARNING(
                'PEXELS_API_KEY nije postavljen — slike će biti placeholder. '
                'Dodaj ključ u Railway Variables pa ponovi seed.'
            ))

        def _grab_listing(args):
            """Vrati (listing, [bytes,…]) — do 3 prave slike za oglas."""
            listing, keyword = args
            if not api_key:
                return listing, []
            try:
                urls = _pexels_search(keyword, api_key, want=3)
            except Exception:
                urls = []
            datas = []
            for u in urls:
                if len(datas) >= 3:
                    break
                try:
                    datas.append(_download(u))
                except Exception:
                    continue
            return listing, datas

        by_listing = {}
        try:
            with ThreadPoolExecutor(max_workers=8) as pool:
                for listing, datas in pool.map(_grab_listing, created_listings):
                    by_listing[listing.id] = datas
        except Exception as e:
            self.stderr.write(self.style.WARNING(f'Paralelno preuzimanje palo: {e}'))

        # ── Sačuvaj slike (sekvencijalno; upload na Cloudinary) ─
        images_created = 0
        real_images = 0
        for listing, _keyword in created_listings:
            datas = by_listing.get(listing.id, [])
            for idx in range(3):
                if idx < len(datas):
                    data = datas[idx]
                    real_images += 1
                else:
                    data = _placeholder(listing.title, idx)
                try:
                    img = ListingImage(listing=listing, is_cover=(idx == 0), order=idx)
                    img.image.save(f'{listing.id}_{idx}.jpg', ContentFile(data), save=True)
                    images_created += 1
                except Exception as e:
                    self.stderr.write(self.style.WARNING(
                        f'  ! Slika preskočena za "{listing.title}" #{idx}: {e}'
                    ))

        # ── Ažuriraj listing_count po kategoriji ───────────
        for slug in cat_increments:
            cat = main_cats[slug]
            cat.listing_count = Listing.objects.filter(category=cat, status='active').count()
            cat.save(update_fields=['listing_count'])

        self.stdout.write(self.style.SUCCESS(
            f'\n✓ Gotovo: {len(users)} korisnika, {len(created_listings)} oglasa, '
            f'{images_created} slika ({real_images} pravih, '
            f'{images_created - real_images} placeholder).'
        ))
        self.stdout.write('  Lozinka za sve test korisnike: test1234')
