import io
import random
from datetime import timedelta

from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand
from django.utils import timezone

from PIL import Image, ImageDraw

from core.models import User, Category, Listing, ListingImage
from core.management.commands.seed import CATEGORIES, slugify_sr


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

# Listing templates grouped by main category slug. Each user picks 3 from
# distinct categories, so there is plenty of variety for filter testing.
LISTING_POOL = [
    ('elektronika', 'iPhone 13 Pro 256GB grafitni',        65000, 'both',   'like_new', 'MacBook ili sličan laptop'),
    ('elektronika', 'MacBook Air M1 2021 srebrni',          95000, 'sell',   'good',     ''),
    ('elektronika', 'Sony WH-1000XM5 slušalice',            28000, 'barter', 'like_new', 'Mehanička tastatura ili gaming miš'),
    ('elektronika', 'Samsung 65" QLED 4K televizor',        78000, 'both',   'like_new', 'Projektor ili manji TV'),
    ('elektronika', 'GoPro Hero 11 Black',                  42000, 'both',   'like_new', 'Stabilizator ili dron'),
    ('elektronika', 'PlayStation 5 Slim + 2 kontrolera',    72000, 'sell',   'good',     ''),
    ('dom',         'Ugaona sofa siva 3+2',                 45000, 'sell',   'good',     ''),
    ('dom',         'Trpezarijski sto hrast 6 mesta',       30000, 'both',   'good',     'Manji sto ili stolice'),
    ('dom',         'LED luster moderni dnevna soba',        8500, 'barter', 'like_new', 'Podna lampa'),
    ('dom',         'Garderober klizna vrata bele',         38000, 'sell',   'good',     ''),
    ('bela-tehnika','Frižider Beko No Frost A++',           42000, 'both',   'good',     'Manji frižider ili zamrzivač'),
    ('bela-tehnika','Veš mašina Gorenje 7kg',               35000, 'sell',   'good',     ''),
    ('bela-tehnika','Klima Vivax 12 inverter',              28000, 'both',   'like_new', 'Grejalica ili ventilator'),
    ('alati',       'Bosch akumulatorska bušilica set',     12000, 'both',   'like_new', 'Ugaona brusilica'),
    ('alati',       'Stihl motorna testera MS 180',         28000, 'sell',   'good',     ''),
    ('alati',       'Agregat benzinski 2.5kW',              22000, 'both',   'good',     'Kompresor ili varilica'),
    ('vozila',      'Bicikl MTB 27.5" Kellys',              35000, 'both',   'good',     'Električni trotinet ili longboard'),
    ('vozila',      'Skuter Piaggio Zip 50',                95000, 'sell',   'good',     ''),
    ('vozila',      'Set zimskih guma 205/55 R16',          18000, 'both',   'good',     'Letnje gume iste veličine'),
    ('vozila',      'Krovni nosač Thule univerzalni',        9500, 'barter', 'like_new', 'Kuka za vuču'),
    ('moda',        'Zimska jakna North Face XL',             8500, 'barter', 'good',     'Letnja jakna ili ranac'),
    ('moda',        'Nike Air Max 270 br. 43',                6000, 'both',   'like_new', 'Jordan ili Adidas br. 43'),
    ('moda',        'Patagonia ranac 30L crni',               7500, 'sell',   'good',     ''),
    ('moda',        'Ručni sat Casio G-Shock',                9000, 'both',   'good',     'Drugi sat ili sunčane naočare'),
    ('lepota',      'Dyson Airwrap komplet',                 38000, 'sell',   'like_new', ''),
    ('lepota',      'Set parfema muški 3x100ml',              7000, 'barter', 'new',      'Ženski parfem'),
    ('sport',       'Bicikl sobni magnetni',                 14000, 'both',   'good',     'Tegovi ili traka za trčanje'),
    ('sport',       'Tegovi set 2×10kg + šipka',              5500, 'barter', 'good',     'Kettlebell ili gume za vežbanje'),
    ('sport',       'Šator za 4 osobe Quechua',              11000, 'both',   'good',     'Spavaća vreća ili ranac'),
    ('sport',       'Skije Atomic 170cm + štapovi',          16000, 'sell',   'good',     ''),
    ('hobi',        'Fender Stratocaster MIM sunburst',      55000, 'both',   'good',     'Les Paul ili Telecaster'),
    ('hobi',        'Roland elektronski klavir FP-30X',      48000, 'sell',   'like_new', ''),
    ('hobi',        'Komplet knjiga — Tolkien',               2500, 'barter', 'good',     'Naučna fantastika ili fantasy'),
    ('hobi',        'Gramofon Audio-Technica LP120',         32000, 'both',   'like_new', 'Pojačalo ili zvučnici'),
    ('deca',        'Kolica Cybex 3u1',                      28000, 'both',   'good',     'Auto-sedište grupa 1'),
    ('deca',        'Drveni krevetac sa dušekom',            12000, 'sell',   'good',     ''),
    ('deca',        'Set edukativnih igračaka Montessori',    4500, 'barter', 'like_new', 'Lego set'),
    ('ljubimci',    'Transporter za mačke/pse M',             3500, 'barter', 'good',     'Oprema za akvarijum'),
    ('ljubimci',    'Akvarijum 100L sa opremom',             15000, 'both',   'good',     'Terarijum'),
    ('basta',       'Baštenska garnitura ratan 4 dela',      32000, 'sell',   'good',     ''),
    ('basta',       'Kosilica benzinska Honda',              35000, 'both',   'good',     'Trimer ili duvač'),
    ('basta',       'Roštilj na ugalj Weber',                14000, 'barter', 'like_new', 'Električni roštilj'),
    ('posao-oprema','Kancelarijska stolica ergonomska',      11000, 'both',   'good',     'Stojeći sto'),
    ('nekretnine',  'Garaža 15m² centar grada',             900000, 'sell',   'good',     ''),
    ('hrana',       'Domaći med bagrem 5kg',                  4500, 'both',   'new',      'Rakija ili sir'),
]

CONDITION_LABEL = dict(Listing.CONDITION_CHOICES)
DESCRIPTIONS = [
    'Odlično očuvano, malo korišćeno. Sve ispravno radi. Ozbiljne ponude. Moguća zamena uz dogovor.',
    'Kupljeno pre godinu dana, bez ikakvih oštećenja. Šaljem širom Srbije, lično preuzimanje u gradu.',
    'Kao novo, čuvano i održavano. Dostupno odmah. Cena fiksna, zamena samo za navedeno.',
    'Polovno ali u top stanju, vidi se na slikama. Brza isporuka, dogovor oko cene moguć.',
    'Stanje besprekorno, original kutija i papiri. Prednost ozbiljnim kupcima i bržem dogovoru.',
]

# Distinct background colors so the 3-image gallery is visibly different.
IMG_COLORS = [
    (13, 110, 111), (184, 89, 10), (28, 124, 84),
    (60, 71, 68), (107, 118, 114), (155, 100, 60),
]


def _make_image(title, idx, color):
    """Generate an 800x600 placeholder JPEG with the listing title drawn on it."""
    img = Image.new('RGB', (800, 600), color)
    draw = ImageDraw.Draw(img)
    # subtle band so cover differs from gallery shots
    draw.rectangle([0, 480, 800, 600], fill=tuple(max(0, c - 30) for c in color))
    short = (title[:34] + '…') if len(title) > 35 else title
    draw.text((40, 270), short, fill=(255, 255, 255))
    draw.text((40, 500), f'Slika {idx + 1} / 3', fill=(235, 235, 235))
    buf = io.BytesIO()
    img.save(buf, format='JPEG', quality=72)
    return buf.getvalue()


class Command(BaseCommand):
    help = '15 test korisnika, svaki sa po 3 oglasa (razne kategorije) i po 3 slike.'

    def add_arguments(self, parser):
        parser.add_argument('--clear', action='store_true',
                            help='Obriši ranije test korisnike (seed_test_*) i njihove oglase.')

    def handle(self, *args, **options):
        rng = random.Random(42)

        if options['clear']:
            usernames = [u['username'] for u in USERS]
            deleted = Listing.objects.filter(user__username__in=usernames).delete()
            User.objects.filter(username__in=usernames).delete()
            self.stdout.write(self.style.WARNING(f'Obrisani raniji test podaci: {deleted}'))

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
        for i, u in enumerate(USERS):
            obj, created = User.objects.get_or_create(
                username=u['username'],
                defaults={
                    'email':        f"{u['username']}@test.dajzameni.rs",
                    'first_name':   u['first'],
                    'last_name':    u['last'],
                    'city':         u['city'],
                    'phone':        f'06{rng.randint(0, 9)}{rng.randint(1000000, 9999999)}',
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
        # Grupiši pool po kategoriji da garantujemo različite kategorije po korisniku.
        by_cat = {}
        for item in LISTING_POOL:
            by_cat.setdefault(item[0], []).append(item)

        listings_created = 0
        images_created = 0
        cat_increments = {}

        for user in users:
            chosen_cats = rng.sample(list(by_cat.keys()), 3)
            for cat_slug in chosen_cats:
                template = rng.choice(by_cat[cat_slug])
                _, title, price, ltype, condition, wants = template
                cat = main_cats.get(cat_slug)

                # Unikatni naslov po korisniku (izbegni slug koliziju / duplikate).
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
                listings_created += 1
                cat_increments[cat_slug] = cat_increments.get(cat_slug, 0) + 1

                for idx in range(3):
                    color = IMG_COLORS[(listings_created + idx) % len(IMG_COLORS)]
                    data = _make_image(title, idx, color)
                    img = ListingImage(listing=listing, is_cover=(idx == 0), order=idx)
                    img.image.save(f'{listing.id}_{idx}.jpg', ContentFile(data), save=True)
                    images_created += 1

        # ── Ažuriraj listing_count po kategoriji ───────────
        for slug, inc in cat_increments.items():
            cat = main_cats[slug]
            cat.listing_count = Listing.objects.filter(category=cat, status='active').count()
            cat.save(update_fields=['listing_count'])

        self.stdout.write(self.style.SUCCESS(
            f'\n✓ Gotovo: {len(users)} korisnika, {listings_created} oglasa, '
            f'{images_created} slika.'
        ))
        self.stdout.write('  Lozinka za sve test korisnike: test1234')
        self.stdout.write('  Korisnička imena: ' + ', '.join(u['username'] for u in USERS[:3]) + ', …')
