# Generated by Django 5.1.4 on 2025-01-21 07:35

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('articles', '0003_insert_TVA_Categorie_Pays'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='article',
            name='consigne',
        ),
        migrations.AddField(
            model_name='article',
            name='prix_consigne',
            field=models.DecimalField(blank=True, decimal_places=2, max_digits=10, null=True),
        ),
    ]
