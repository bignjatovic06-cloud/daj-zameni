from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0009_seed_categories'),
    ]

    operations = [
        migrations.AddField(
            model_name='swapoffer',
            name='completed_by_from',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='swapoffer',
            name='completed_by_to',
            field=models.BooleanField(default=False),
        ),
    ]
