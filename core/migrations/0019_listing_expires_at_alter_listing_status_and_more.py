from datetime import timedelta

from django.db import migrations, models


def backfill_expires_at(apps, schema_editor):
    Listing = apps.get_model("core", "Listing")
    for listing in Listing.objects.filter(status="active", expires_at__isnull=True):
        Listing.objects.filter(pk=listing.pk).update(
            expires_at=listing.created_at + timedelta(days=15)
        )


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0018_promote_admin"),
    ]

    operations = [
        migrations.AddField(
            model_name="listing",
            name="expires_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.RunPython(backfill_expires_at, migrations.RunPython.noop),
        migrations.AlterField(
            model_name="listing",
            name="status",
            field=models.CharField(
                choices=[
                    ("active", "Aktivan"),
                    ("reserved", "Rezervisan"),
                    ("closed", "Zatvoren"),
                    ("expired", "Istekao"),
                ],
                default="active",
                max_length=10,
            ),
        ),
        migrations.AddIndex(
            model_name="listing",
            index=models.Index(
                fields=["status", "expires_at"], name="listing_status_expires_idx"
            ),
        ),
    ]
