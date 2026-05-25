from django.db import migrations

ADMIN_EMAIL = 'bane.ignjatovic08@gmail.com'


def promote(apps, schema_editor):
    User = apps.get_model('core', 'User')
    User.objects.filter(email=ADMIN_EMAIL).update(is_staff=True, is_superuser=True)


def demote(apps, schema_editor):
    User = apps.get_model('core', 'User')
    User.objects.filter(email=ADMIN_EMAIL).update(is_staff=False, is_superuser=False)


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0017_pushsubscription_swapoffer_reminder'),
    ]

    operations = [
        migrations.RunPython(promote, demote),
    ]
