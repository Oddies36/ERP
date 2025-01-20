# Generated by Django 5.1.4 on 2025-01-20 21:20

from django.db import migrations

def addCategory(apps, schema_editor):
    Categorie = apps.get_model('articles', 'Categorie')
    Categorie.objects.create(categorie="Bières")
    Categorie.objects.create(categorie="Nourriture")
    Categorie.objects.create(categorie="Vêtements")


class Migration(migrations.Migration):

    dependencies = [
        ('articles', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(addCategory)
    ]
