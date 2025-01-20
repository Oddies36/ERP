from django.db import migrations


def insertTVACategoriePays(apps, schema_editor):
    Pays = apps.get_model('clients', 'Pays')
    Categorie = apps.get_model('articles', 'Categorie')
    TVA_Categorie_Pays = apps.get_model('articles', 'TVA_Categorie_Pays')

    tva = {
        'AT': {'Bières': 20.0, 'Nourriture': 10.0, 'Vêtements': 20.0},
        'BE': {'Bières': 21.0, 'Nourriture': 6.0, 'Vêtements': 21.0},
        'BG': {'Bières': 20.0, 'Nourriture': 20.0, 'Vêtements': 20.0},
        'HR': {'Bières': 25.0, 'Nourriture': 13.0, 'Vêtements': 25.0},
        'CY': {'Bières': 19.0, 'Nourriture': 5.0, 'Vêtements': 19.0},
        'CZ': {'Bières': 21.0, 'Nourriture': 15.0, 'Vêtements': 21.0},
        'DK': {'Bières': 25.0, 'Nourriture': 25.0, 'Vêtements': 25.0},
        'EE': {'Bières': 20.0, 'Nourriture': 20.0, 'Vêtements': 20.0},
        'FI': {'Bières': 24.0, 'Nourriture': 14.0, 'Vêtements': 24.0},
        'FR': {'Bières': 20.0, 'Nourriture': 5.5, 'Vêtements': 20.0},
        'DE': {'Bières': 19.0, 'Nourriture': 7.0, 'Vêtements': 19.0},
        'GR': {'Bières': 24.0, 'Nourriture': 13.0, 'Vêtements': 24.0},
        'HU': {'Bières': 27.0, 'Nourriture': 18.0, 'Vêtements': 27.0},
        'IE': {'Bières': 23.0, 'Nourriture': 0.0, 'Vêtements': 23.0},
        'IT': {'Bières': 22.0, 'Nourriture': 10.0, 'Vêtements': 22.0},
        'LV': {'Bières': 21.0, 'Nourriture': 21.0, 'Vêtements': 21.0},
        'LT': {'Bières': 21.0, 'Nourriture': 21.0, 'Vêtements': 21.0},
        'LU': {'Bières': 17.0, 'Nourriture': 3.0, 'Vêtements': 17.0},
        'MT': {'Bières': 18.0, 'Nourriture': 18.0, 'Vêtements': 18.0},
        'NL': {'Bières': 21.0, 'Nourriture': 9.0, 'Vêtements': 21.0},
        'PL': {'Bières': 23.0, 'Nourriture': 5.0, 'Vêtements': 23.0},
        'PT': {'Bières': 23.0, 'Nourriture': 6.0, 'Vêtements': 23.0},
        'RO': {'Bières': 19.0, 'Nourriture': 9.0, 'Vêtements': 19.0},
        'SK': {'Bières': 20.0, 'Nourriture': 10.0, 'Vêtements': 20.0},
        'SI': {'Bières': 22.0, 'Nourriture': 9.5, 'Vêtements': 22.0},
        'ES': {'Bières': 21.0, 'Nourriture': 10.0, 'Vêtements': 21.0},
        'SE': {'Bières': 25.0, 'Nourriture': 12.0, 'Vêtements': 25.0},
    }

    for iso, nombre in tva.items():
        country = Pays.objects.get(code_iso=iso)

        for nom_categorie, nombre in nombre.items():
            categorie, _ = Categorie.objects.get_or_create(categorie=nom_categorie)

            TVA_Categorie_Pays.objects.create(
                pays=country,
                categorie=categorie,
                tva=nombre
            )


class Migration(migrations.Migration):

    dependencies = [
        ('articles', '0002_insert_category'),
        ('clients', '0002_insert_pays'),
    ]

    operations = [
        migrations.RunPython(insertTVACategoriePays),
    ]