from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0005_message_swap_offer_alter_message_body'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='wishlist',
            field=models.ManyToManyField(blank=True, related_name='wishlisted_by', to='core.listing'),
        ),
    ]
