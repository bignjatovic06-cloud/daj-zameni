import sys

from django.db import migrations


def seed(apps, schema_editor):
    # Skip during the test suite — test DBs run all migrations and we don't
    # want to upload images / create fixtures on every test run.
    if 'test' in sys.argv:
        return
    from django.core.management import call_command
    try:
        call_command('seed_test')
    except Exception as e:
        # Seeding test data must never break the deploy's migrate step.
        print(f'seed_test skipped: {e}')


def unseed(apps, schema_editor):
    User = apps.get_model('core', 'User')
    User.objects.filter(email__endswith='@test.dajzameni.rs').delete()


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0020_listing_expiry_reminder_sent_alter_notification_type'),
    ]

    operations = [
        migrations.RunPython(seed, unseed),
    ]
