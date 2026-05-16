from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0007_alter_review_swap_offer'),
    ]

    operations = [
        migrations.AddField(
            model_name='listing',
            name='is_premium',
            field=models.BooleanField(default=False),
        ),
        migrations.AlterField(
            model_name='listing',
            name='condition',
            field=models.CharField(
                choices=[
                    ('new',      'Novo'),
                    ('like_new', 'Polovno — kao novo'),
                    ('good',     'Polovno — odlično'),
                    ('fair',     'Polovno — vrlo dobro'),
                    ('poor',     'Polovno — dobro'),
                    ('antique',  'Antikvitet'),
                ],
                default='good',
                max_length=10,
            ),
        ),
    ]
