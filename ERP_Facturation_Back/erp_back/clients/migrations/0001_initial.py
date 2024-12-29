# Generated by Django 5.1.4 on 2024-12-29 22:55

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Client',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nom', models.CharField(max_length=255)),
                ('prenom', models.CharField(max_length=255)),
                ('telephone', models.CharField(max_length=30)),
                ('email', models.EmailField(max_length=254)),
                ('nom_entreprise', models.CharField(blank=True, max_length=255)),
                ('tva_entreprise', models.CharField(blank=True, max_length=255)),
            ],
        ),
        migrations.CreateModel(
            name='Code_Postal',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('cp', models.CharField(max_length=10)),
            ],
        ),
        migrations.CreateModel(
            name='Pays',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('pays', models.CharField(max_length=255)),
                ('code_iso', models.CharField(max_length=3)),
            ],
        ),
        migrations.CreateModel(
            name='Type_Adresse',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('type_adresse', models.CharField(max_length=50)),
            ],
        ),
        migrations.CreateModel(
            name='Adresse',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('rue', models.CharField(max_length=255)),
                ('numero', models.CharField(max_length=10)),
                ('boite', models.CharField(blank=True, max_length=10)),
                ('code_postal', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='clients.code_postal')),
            ],
        ),
        migrations.CreateModel(
            name='Ville',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('ville', models.CharField(max_length=255)),
                ('pays', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='clients.pays')),
            ],
        ),
        migrations.AddField(
            model_name='code_postal',
            name='ville',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='clients.ville'),
        ),
        migrations.CreateModel(
            name='Client_Adresse',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('adresse', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='clients.adresse')),
                ('client', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='clients.client')),
                ('type_adresse', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='clients.type_adresse')),
            ],
            options={
                'unique_together': {('client', 'adresse', 'type_adresse')},
            },
        ),
    ]