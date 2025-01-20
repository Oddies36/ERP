# Generated by Django 5.1.4 on 2025-01-19 23:49

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('clients', '0003_insert_type_adresse'),
    ]

    operations = [
        migrations.CreateModel(
            name='Categorie',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('categorie', models.CharField(max_length=255)),
            ],
        ),
        migrations.CreateModel(
            name='Article',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('article', models.CharField(max_length=255)),
                ('ean', models.CharField(max_length=13, unique=True)),
                ('prix_htva', models.DecimalField(decimal_places=2, max_digits=10)),
                ('description', models.TextField(blank=True, null=True)),
                ('prix_achat', models.DecimalField(decimal_places=2, max_digits=10)),
                ('qty_min', models.IntegerField()),
                ('qty_oos', models.IntegerField()),
                ('qty_order', models.IntegerField()),
                ('qty_stock', models.IntegerField()),
                ('unit', models.CharField(max_length=50)),
                ('pourcentage_alc', models.DecimalField(blank=True, decimal_places=2, max_digits=5, null=True)),
                ('volume', models.DecimalField(blank=True, decimal_places=2, max_digits=10, null=True)),
                ('consigne', models.BooleanField(default=False)),
                ('qty_paquet', models.IntegerField()),
                ('poids', models.DecimalField(blank=True, decimal_places=3, max_digits=10, null=True)),
                ('categorie', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='articles', to='articles.categorie')),
            ],
        ),
        migrations.CreateModel(
            name='Mouvements_Stock',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date_mouvement', models.DateTimeField(auto_now_add=True)),
                ('quantite', models.IntegerField()),
                ('type_mouvement', models.CharField(max_length=50)),
                ('description_mouvement', models.TextField(blank=True, null=True)),
                ('article', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='mouvements', to='articles.article')),
            ],
        ),
        migrations.CreateModel(
            name='TVA_Categorie_Pays',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('tva', models.DecimalField(decimal_places=2, max_digits=5)),
                ('categorie', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='tva_rates', to='articles.categorie')),
                ('pays', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='tva_categorie_pays', to='clients.pays')),
            ],
        ),
    ]
