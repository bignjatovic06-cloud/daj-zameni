import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0006_user_wishlist'),
    ]

    operations = [
        migrations.AlterField(
            model_name='review',
            name='swap_offer',
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name='reviews',
                to='core.swapoffer',
            ),
        ),
        migrations.AlterUniqueTogether(
            name='review',
            unique_together={('from_user', 'swap_offer')},
        ),
    ]
