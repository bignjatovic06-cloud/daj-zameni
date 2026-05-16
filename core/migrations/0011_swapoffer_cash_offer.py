from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0010_swapoffer_dual_completion'),
    ]

    operations = [
        migrations.AddField(
            model_name='swapoffer',
            name='cash_offer',
            field=models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True),
        ),
    ]
