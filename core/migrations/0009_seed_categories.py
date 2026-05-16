from django.db import migrations

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


import re

def slugify_sr(text):
    text = text.lower()
    for ch, rep in [('č','c'),('ć','c'),('š','s'),('ž','z'),('đ','dj')]:
        text = text.replace(ch, rep)
    text = re.sub(r'[^a-z0-9]+', '-', text)
    return text.strip('-')


def seed_categories(apps, schema_editor):
    Category = apps.get_model('core', 'Category')
    for order, c in enumerate(CATEGORIES):
        parent, _ = Category.objects.get_or_create(
            slug=c['id'],
            defaults={
                'name':  c['name'],
                'icon':  c['icon'],
                'tint':  c['tint'],
                'order': order,
            },
        )
        for sub_order, sub_name in enumerate(c['subs']):
            sub_slug = c['id'] + '/' + slugify_sr(sub_name)
            Category.objects.get_or_create(
                slug=sub_slug,
                defaults={
                    'name':   sub_name,
                    'icon':   c['icon'],
                    'tint':   c['tint'],
                    'parent': parent,
                    'order':  sub_order,
                },
            )


def unseed_categories(apps, schema_editor):
    Category = apps.get_model('core', 'Category')
    Category.objects.filter(slug__in=[c['id'] for c in CATEGORIES]).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0008_listing_antique_is_premium'),
    ]

    operations = [
        migrations.RunPython(seed_categories, unseed_categories),
    ]
