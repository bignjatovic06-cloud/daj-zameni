import sys

from django.db import migrations


def reseed(apps, schema_editor):
    # Skip during the test suite.
    if 'test' in sys.argv:
        return
    User = apps.get_model('core', 'User')
    # Drop the earlier placeholder-image test data so seed_test rebuilds
    # it with real photos. Cascades to listings + images.
    User.objects.filter(email__endswith='@test.dajzameni.rs').delete()

    from django.core.management import call_command
    try:
        call_command('seed_test')
    except Exception as e:
        print(f'seed_test (reseed) skipped: {e}')


def noop(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0021_seed_test_data'),
    ]

    operations = [
        migrations.RunPython(reseed, noop),
    ]
