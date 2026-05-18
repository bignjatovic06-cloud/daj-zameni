from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0013_email_verification_token"),
    ]

    operations = [
        migrations.AddField(
            model_name="user",
            name="email_verification_sent_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
