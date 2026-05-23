from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0014_email_verification_sent_at"),
    ]

    operations = [
        # Listing: najčešći filter + sort
        migrations.AddIndex(
            model_name="listing",
            index=models.Index(fields=["status", "-created_at"], name="listing_status_created_idx"),
        ),
        migrations.AddIndex(
            model_name="listing",
            index=models.Index(fields=["user", "status"], name="listing_user_status_idx"),
        ),
        migrations.AddIndex(
            model_name="listing",
            index=models.Index(fields=["category", "status"], name="listing_category_status_idx"),
        ),
        # Message: sort poruka u chatu + unread check
        migrations.AddIndex(
            model_name="message",
            index=models.Index(fields=["conversation", "created_at"], name="message_conv_created_idx"),
        ),
        migrations.AddIndex(
            model_name="message",
            index=models.Index(fields=["conversation", "is_read"], name="message_conv_read_idx"),
        ),
        # Notification: učitavanje notifikacija korisnika
        migrations.AddIndex(
            model_name="notification",
            index=models.Index(fields=["user", "-created_at"], name="notification_user_created_idx"),
        ),
        # SwapOffer: moje ponude + ponude za oglas
        migrations.AddIndex(
            model_name="swapoffer",
            index=models.Index(fields=["from_user", "status"], name="offer_from_user_status_idx"),
        ),
        migrations.AddIndex(
            model_name="swapoffer",
            index=models.Index(fields=["listing", "status"], name="offer_listing_status_idx"),
        ),
    ]
