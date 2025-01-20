from django.db import models

class Pays(models.Model):
    pays = models.CharField(max_length=255)
    code_iso = models.CharField(max_length=3)

class Ville(models.Model):
    ville = models.CharField(max_length=255)
    pays = models.ForeignKey(Pays, on_delete=models.CASCADE)

class Code_Postal(models.Model):
    cp = models.CharField(max_length=10)
    ville = models.ForeignKey(Ville, on_delete=models.CASCADE)

class Client(models.Model):
    nom = models.CharField(max_length=255)
    prenom = models.CharField(max_length=255)
    telephone = models.CharField(max_length=30)
    email = models.EmailField()
    nom_entreprise = models.CharField(max_length=255, blank=True, null=True)
    tva_entreprise = models.CharField(max_length=255, blank=True, null=True)

class Adresse(models.Model):
    rue = models.CharField(max_length=255)
    numero = models.CharField(max_length=10)
    boite = models.CharField(max_length=10, blank=True)
    code_postal = models.ForeignKey(Code_Postal, on_delete=models.CASCADE)
    clients = models.ManyToManyField('Client', related_name='adresses')


class Type_Adresse(models.Model):
    type_adresse = models.CharField(max_length=50)
    adresses = models.ManyToManyField('Adresse', related_name='type_adresses')
