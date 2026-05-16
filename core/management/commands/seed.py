from django.core.management.base import BaseCommand
from core.models import User, Category, Listing
import random
import re


def slugify_sr(text):
    text = text.lower()
    for ch, rep in [('č','c'),('ć','c'),('š','s'),('ž','z'),('đ','dj')]:
        text = text.replace(ch, rep)
    text = re.sub(r'[^a-z0-9]+', '-', text)
    return text.strip('-')


CATEGORIES = [
    { 'id': 'elektronika', 'name': 'Elektronika', 'icon': 'device', 'tint': 'blue', 'subs': [
        'Mobilni telefoni','Dodaci za telefone','Računari','Laptopovi','Tableti',
        'Delovi za računar','Monitori','Štampači i skeneri','Gejming konzole','Igre',
        'Fotoaparati','Dronovi','Pametni satovi','Audio oprema','Slušalice',
        'Televizori','Streaming uređaji','Mrežna oprema','Smart home uređaji','Ostala elektronika',
    ]},
    { 'id': 'dom', 'name': 'Dom i nameštaj', 'icon': 'sofa', 'tint': 'amber', 'subs': [
        'Nameštaj za dnevnu sobu','Nameštaj za spavaću sobu','Nameštaj za kuhinju','Nameštaj za kupatilo','Nameštaj za kancelariju',
        'Nameštaj za decu','Dušeci','Dekoracija za dom','Rasveta','Tepisi i staze',
        'Zavese i tekstil','Police i sistemi za odlaganje','Nameštaj za dvorište','Kućne sitnice','Posuđe i kuhinjski pribor',
        'Ostalo za dom',
    ]},
    { 'id': 'bela-tehnika', 'name': 'Bela tehnika i aparati', 'icon': 'appliance', 'tint': 'blue', 'subs': [
        'Frižideri i zamrzivači','Veš mašine','Mašine za sušenje','Sudomašine','Šporeti i rerne',
        'Mikrotalasne','Mali kuhinjski aparati','Usisivači','Klima uređaji','Grejalice',
        'Bojleri','Prečišćivači vazduha','Ventilatori','Šivaće mašine','Ostali aparati',
    ]},
    { 'id': 'alati', 'name': 'Alati i mašine', 'icon': 'wrench', 'tint': 'neutral', 'subs': [
        'Ručni alati','Električni alati','Radionička oprema','Građevinski alati','Baštenski alati',
        'Poljoprivredni alati','Industrijske mašine','Kompresori','Generatori','Oprema za varenje',
        'Merni alati','Zaštitna oprema','Rezervni delovi za alate','Ostali alati i mašine',
    ]},
    { 'id': 'vozila', 'name': 'Vozila', 'icon': 'car', 'tint': 'blue', 'subs': [
        'Automobili','Motori','Skuteri','Bicikli','Električni bicikli',
        'Kombiji i komercijalna vozila','Prikolice','Čamci','Delovi za auto','Delovi za moto',
        'Gume i felne','Auto elektronika','Auto oprema','Dečija auto-sedišta','Ostala vozila',
    ]},
    { 'id': 'moda', 'name': 'Moda', 'icon': 'shirt', 'tint': 'amber', 'subs': [
        'Ženska odeća','Muška odeća','Dečija odeća','Garderoba za bebe','Obuća',
        'Torbe i rančevi','Satovi','Nakit','Naočare za sunce','Kaiševi i novčanici',
        'Sportska odeća','Tradicionalna odeća','Svečana odeća','Ostali modni artikli',
    ]},
    { 'id': 'lepota', 'name': 'Lepota i nega', 'icon': 'sparkle', 'tint': 'amber', 'subs': [
        'Nega kože','Šminka','Nega kose','Parfemi','Uređaji za negu',
        'Alati za lepotu','Nega noktiju','Lična higijena','Wellness proizvodi','Ostalo za lepotu i negu',
    ]},
    { 'id': 'sport', 'name': 'Sport i rekreacija', 'icon': 'ball', 'tint': 'green', 'subs': [
        'Oprema za fitnes','Oprema za teretanu','Trčanje','Biciklizam','Fudbal',
        'Košarka','Tenis','Borilački sportovi','Zimski sportovi','Vodeni sportovi',
        'Kamp oprema','Ribolov','Lov','Outdoor oprema','Ostali sportski artikli',
    ]},
    { 'id': 'hobi', 'name': 'Hobiji i kolekcionarstvo', 'icon': 'book', 'tint': 'amber', 'subs': [
        'Knjige','Stripovi','Magazini','Vinili','CD i DVD',
        'Muzički instrumenti','Društvene igre','Puzzle','Kolekcionarske figure','Antikviteti',
        'Novčići','Marke','Umetnički predmeti','Ručni rad','Suveniri','Ostali kolekcionarski predmeti',
    ]},
    { 'id': 'deca', 'name': 'Deca i bebe', 'icon': 'baby', 'tint': 'blue', 'subs': [
        'Oprema za bebe','Kolica','Auto-sedišta','Krevetići','Ishrana za bebe',
        'Nega beba','Igračke','Edukativne igračke','Školski pribor','Nameštaj za decu',
        'Sportska oprema za decu','Trudnički artikli','Ostalo za decu',
    ]},
    { 'id': 'ljubimci', 'name': 'Ljubimci', 'icon': 'paw', 'tint': 'amber', 'subs': [
        'Psi','Mačke','Ptice','Ribe i akvarijumi','Mali ljubimci',
        'Hrana za ljubimce','Oprema za ljubimce','Krevetići i ležajevi','Transport za ljubimce','Proizvodi za negu ljubimaca',
        'Veterinarska i zdravstvena oprema','Ostalo za ljubimce',
    ]},
    { 'id': 'basta', 'name': 'Bašta i spoljašnji prostor', 'icon': 'leaf', 'tint': 'green', 'subs': [
        'Biljke','Semena','Baštenski alati','Baštenski nameštaj','Saksije i žardinjere',
        'Oprema za navodnjavanje','Spoljašnja dekoracija','Roštilj i kuvanje napolju','Bazeni i oprema','Ograde i oprema za dvorište','Ostalo za baštu',
    ]},
    { 'id': 'posao-oprema', 'name': 'Posao i kancelarija', 'icon': 'briefcase', 'tint': 'neutral', 'subs': [
        'Kancelarijski nameštaj','Kancelarijska oprema','Štampači i kopiri','POS oprema','Oprema za skladištenje',
        'Ambalaža','Oprema za maloprodaju','Poslovni softver','Ugostiteljska oprema','Salon oprema','Medicinska oprema za ordinacije','Ostalo za posao',
    ]},
    { 'id': 'usluge', 'name': 'Usluge', 'icon': 'spark', 'tint': 'blue', 'subs': [
        'Prevoz','Selidbe','Čišćenje','Popravke','IT usluge',
        'Grafički dizajn','Web development','Fotografija','Video produkcija','Marketing',
        'Prevođenje','Edukacija i podučavanje','Beauty usluge','Održavanje doma','Organizacija događaja','Ostale usluge',
    ]},
    { 'id': 'poslovi', 'name': 'Poslovi i angažmani', 'icon': 'user-check', 'tint': 'neutral', 'subs': [
        'Puno radno vreme','Nepuno radno vreme','Freelance poslovi','Remote poslovi','Studentski poslovi',
        'Zanatski poslovi','Ugostiteljstvo','Dostava','Administracija','Prodaja','IT poslovi','Kreativni poslovi','Ostali poslovi',
    ]},
    { 'id': 'nekretnine', 'name': 'Nekretnine', 'icon': 'home', 'tint': 'blue', 'subs': [
        'Stanovi za prodaju','Stanovi za izdavanje','Kuće za prodaju','Kuće za izdavanje','Poslovni prostor',
        'Zemljište i placevi','Garaže','Skladišni prostori','Vikendice','Sobe za izdavanje','Ostale nekretnine',
    ]},
    { 'id': 'hrana', 'name': 'Hrana i poljoprivreda', 'icon': 'wheat', 'tint': 'amber', 'subs': [
        'Domaća hrana','Poljoprivredni proizvodi','Voće i povrće','Meso i mlečni proizvodi','Pića',
        'Med i prirodni proizvodi','Semena i rasad','Oprema za stočarstvo','Poljoprivredni materijal','Ostalo iz hrane i poljoprivrede',
    ]},
    { 'id': 'zdravlje', 'name': 'Zdravlje i medicinska oprema', 'icon': 'heart', 'tint': 'blue', 'subs': [
        'Medicinski uređaji','Ortopedska pomagala','Pomagala za kretanje','Naočare i optika','Uređaji za praćenje zdravlja','Wellness oprema','Ostalo za zdravlje',
    ]},
    { 'id': 'karte', 'name': 'Karte i događaji', 'icon': 'ticket', 'tint': 'amber', 'subs': [
        'Karte za koncerte','Karte za sport','Karte za festivale','Karte za pozorište','Putne karte','Kursevi i radionice','Ulaznice','Ostale karte',
    ]},
    { 'id': 'besplatno', 'name': 'Besplatno / poklon', 'icon': 'gift', 'tint': 'green', 'subs': [
        'Besplatni nameštaj','Besplatna elektronika','Besplatna odeća','Besplatni dečiji artikli','Besplatni materijali','Ostalo besplatno',
    ]},
    { 'id': 'ostalo', 'name': 'Ostalo', 'icon': 'dots', 'tint': 'neutral', 'subs': [
        'Razni predmeti','Neuklopljeni oglasi','Retki artikli',
    ]},
]

LISTINGS = [
    {'title': 'iPhone 13 Pro 256GB grafitni',       'category': 'elektronika', 'price': 65000, 'type': 'both',   'condition': 'like_new', 'city': 'Beograd',    'wants': 'MacBook ili sličan laptop'},
    {'title': 'MacBook Air M1 2021',                'category': 'elektronika', 'price': 95000, 'type': 'sell',   'condition': 'good',     'city': 'Novi Sad',   'wants': ''},
    {'title': 'Sony WH-1000XM5 slušalice',          'category': 'elektronika', 'price': 28000, 'type': 'barter', 'condition': 'like_new', 'city': 'Kragujevac', 'wants': 'Mehanička tastatura ili gaming miš'},
    {'title': 'Nintendo Switch OLED bijeli',         'category': 'elektronika', 'price': 38000, 'type': 'both',   'condition': 'good',     'city': 'Beograd',    'wants': 'PS5 kontroler ili igrice'},
    {'title': 'GoPro Hero 11 Black',                'category': 'elektronika', 'price': 42000, 'type': 'both',   'condition': 'like_new', 'city': 'Niš',        'wants': 'Stabilizator ili dron'},
    {'title': 'Zimska jakna North Face XL',         'category': 'moda',        'price':  8500, 'type': 'barter', 'condition': 'good',     'city': 'Beograd',    'wants': 'Letnja jakna ili ranac'},
    {'title': 'Nike Air Max 270 br. 43',            'category': 'moda',        'price':  6000, 'type': 'both',   'condition': 'like_new', 'city': 'Novi Sad',   'wants': 'Jordan ili Adidas iste veličine'},
    {'title': 'Patagonia ranac 30L crni',           'category': 'moda',        'price':  7500, 'type': 'sell',   'condition': 'good',     'city': 'Kragujevac', 'wants': ''},
    {'title': 'Komplet knjiga — Tolkien',           'category': 'hobi',        'price':  2500, 'type': 'barter', 'condition': 'good',     'city': 'Beograd',    'wants': 'Naučna fantastika ili fantasy knjige'},
    {'title': 'Udžbenici za 1. razred PM fakulteta','category': 'hobi',        'price':  3000, 'type': 'both',   'condition': 'good',     'city': 'Novi Sad',   'wants': 'Udžbenici za 2. razred'},
    {'title': 'Bicikl MTB 27.5" Kellys',            'category': 'sport',       'price': 35000, 'type': 'both',   'condition': 'good',     'city': 'Beograd',    'wants': 'Električni trotinet ili longboard'},
    {'title': 'Tegovi set 2×10kg + šipka',          'category': 'sport',       'price':  5500, 'type': 'barter', 'condition': 'good',     'city': 'Subotica',   'wants': 'Kettlebell ili gume za vežbanje'},
    {'title': 'Fender Stratocaster MIM sunburst',   'category': 'hobi',        'price': 55000, 'type': 'both',   'condition': 'good',     'city': 'Beograd',    'wants': 'Les Paul ili Telecaster'},
    {'title': 'Roland elektronski klavir FP-30X',   'category': 'hobi',        'price': 48000, 'type': 'sell',   'condition': 'like_new', 'city': 'Novi Sad',   'wants': ''},
    {'title': 'Komplet opreme za papagaja',         'category': 'ljubimci',    'price':  4500, 'type': 'barter', 'condition': 'good',     'city': 'Niš',        'wants': 'Oprema za mačku ili psa'},
    {'title': 'Samsung 65" QLED 4K televizor',      'category': 'elektronika', 'price': 78000, 'type': 'both',   'condition': 'like_new', 'city': 'Beograd',    'wants': 'Projektor ili manji TV'},
    {'title': 'Sofa ugaona siva 3+2',               'category': 'dom',         'price': 45000, 'type': 'sell',   'condition': 'good',     'city': 'Novi Sad',   'wants': ''},
    {'title': 'Bicikl City Bike 28" ženski',        'category': 'vozila',      'price': 18000, 'type': 'both',   'condition': 'good',     'city': 'Niš',        'wants': 'Električni trotinet'},
    {'title': 'Bosch akumulatorska bušilica set',   'category': 'alati',       'price': 12000, 'type': 'both',   'condition': 'like_new', 'city': 'Kragujevac', 'wants': 'Ugaona brusilica ili vibraciona bušilica'},
    {'title': 'Kaučuk biljka 150cm',               'category': 'basta',       'price':  3500, 'type': 'barter', 'condition': 'new',      'city': 'Beograd',    'wants': 'Monstera ili Fiddle leaf fig'},
]

USERS = [
    {'username': 'marko_bg',  'email': 'marko@test.com',  'city': 'Beograd'},
    {'username': 'ana_ns',    'email': 'ana@test.com',    'city': 'Novi Sad'},
    {'username': 'stefan_kg', 'email': 'stefan@test.com', 'city': 'Kragujevac'},
    {'username': 'jelena_ni', 'email': 'jelena@test.com', 'city': 'Niš'},
    {'username': 'nikola_su', 'email': 'nikola@test.com', 'city': 'Subotica'},
]


class Command(BaseCommand):
    help = 'Seed baze: 21 kategorija, ~280 podkategorija, korisnici, oglasi'

    def add_arguments(self, parser):
        parser.add_argument('--clear', action='store_true', help='Obriši sve pre seedovanja')

    def handle(self, *args, **options):
        if options['clear']:
            Listing.objects.all().delete()
            User.objects.filter(is_superuser=False).delete()
            Category.objects.all().delete()
            self.stdout.write(self.style.WARNING('Stari podaci obrisani.'))

        # ── Kategorije ─────────────────────────────────────
        main_cats = {}
        total_subs = 0

        for order, c in enumerate(CATEGORIES):
            parent, created = Category.objects.get_or_create(
                slug=c['id'],
                defaults={
                    'name':  c['name'],
                    'icon':  c['icon'],
                    'tint':  c['tint'],
                    'order': order,
                }
            )
            main_cats[c['id']] = parent
            if created:
                self.stdout.write(f'  + {parent.name}')

            for sub_order, sub_name in enumerate(c['subs']):
                sub_slug = c['id'] + '/' + slugify_sr(sub_name)
                _, sub_created = Category.objects.get_or_create(
                    slug=sub_slug,
                    defaults={
                        'name':   sub_name,
                        'icon':   c['icon'],
                        'tint':   c['tint'],
                        'parent': parent,
                        'order':  sub_order,
                    }
                )
                if sub_created:
                    total_subs += 1

        self.stdout.write(f'  Podkategorije: {total_subs} kreiranih')

        # ── Korisnici ──────────────────────────────────────
        users = []
        for u in USERS:
            obj, created = User.objects.get_or_create(
                username=u['username'],
                defaults={
                    'email':        u['email'],
                    'city':         u['city'],
                    'rating':       round(random.uniform(3.5, 5.0), 2),
                    'rating_count': random.randint(2, 40),
                }
            )
            if created:
                obj.set_password('test1234')
                obj.save()
                self.stdout.write(f'  Korisnik: {obj.username}')
            users.append(obj)

        # ── Oglasi ─────────────────────────────────────────
        count = 0
        for l in LISTINGS:
            cat  = main_cats.get(l['category'])
            user = random.choice(users)

            listing, created = Listing.objects.get_or_create(
                title=l['title'],
                defaults={
                    'user':              user,
                    'category':          cat,
                    'description':       f'Prodajem/menjam: {l["title"]}. Odlično stanje, sve funkcioniše besprekorno. Ozbiljne ponude.',
                    'price':             l['price'],
                    'listing_type':      l['type'],
                    'condition':         l['condition'],
                    'city':              l['city'],
                    'wants_in_exchange': l['wants'],
                    'views':             random.randint(10, 400),
                }
            )
            if created:
                count += 1
                if cat:
                    cat.listing_count += 1
                    cat.save(update_fields=['listing_count'])

        self.stdout.write(self.style.SUCCESS(
            f'\n✓ Seed završen: 21 kategorija, {total_subs} podkategorija, '
            f'{len(users)} korisnika, {count} oglasa.'
        ))
        self.stdout.write('  Lozinka za sve test korisnike: test1234')