from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0015_db_indexes"),
    ]

    operations = [
        migrations.AddConstraint(
            model_name="swapoffer",
            constraint=models.UniqueConstraint(
                fields=["listing", "from_user"],
                name="unique_offer_per_listing_per_user",
            ),
        ),
    ]
