from django.db import migrations


def clear_phones(apps, schema_editor):
    User = apps.get_model('core', 'User')
    User.objects.filter(email__endswith='@test.dajzameni.rs').update(phone='')


def noop(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0022_reseed_test_real_images'),
    ]

    operations = [
        migrations.RunPython(clear_phones, noop),
    ]
