from django.db import migrations

def addPays(apps, schema_editor):
    Pays = apps.get_model('clients', 'Pays')
    Pays.objects.create(pays="Autriche", code_iso="AT")
    Pays.objects.create(pays="Belgique", code_iso="BE")
    Pays.objects.create(pays="Bulgarie", code_iso="BG")
    Pays.objects.create(pays="Croatie", code_iso="HR")
    Pays.objects.create(pays="Chypre", code_iso="CY")
    Pays.objects.create(pays="République tchèque", code_iso="CZ")
    Pays.objects.create(pays="Danemark", code_iso="DK")
    Pays.objects.create(pays="Estonie", code_iso="EE")
    Pays.objects.create(pays="Finlande", code_iso="FI")
    Pays.objects.create(pays="France", code_iso="FR")
    Pays.objects.create(pays="Allemagne", code_iso="DE")
    Pays.objects.create(pays="Grèce", code_iso="GR")
    Pays.objects.create(pays="Hongrie", code_iso="HU")
    Pays.objects.create(pays="Irlande", code_iso="IE")
    Pays.objects.create(pays="Italie", code_iso="IT")
    Pays.objects.create(pays="Lettonie", code_iso="LV")
    Pays.objects.create(pays="Lituanie", code_iso="LT")
    Pays.objects.create(pays="Luxembourg", code_iso="LU")
    Pays.objects.create(pays="Malte", code_iso="MT")
    Pays.objects.create(pays="Pays-Bas", code_iso="NL")
    Pays.objects.create(pays="Pologne", code_iso="PL")
    Pays.objects.create(pays="Portugal", code_iso="PT")
    Pays.objects.create(pays="Roumanie", code_iso="RO")
    Pays.objects.create(pays="Slovaquie", code_iso="SK")
    Pays.objects.create(pays="Slovénie", code_iso="SI")
    Pays.objects.create(pays="Espagne", code_iso="ES")
    Pays.objects.create(pays="Suède", code_iso="SE")

class Migration(migrations.Migration):

    dependencies = [
        ('clients', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(addPays)
    ]