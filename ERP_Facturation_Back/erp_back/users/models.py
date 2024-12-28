from django.db import models

class Client(models.Model):
    Nom = models.CharField(max_length=100)
    Prenom = models.CharField(max_length=100)
    Telephone = models.CharField(max_length=50)
    Email = models.EmailField()
    Nom_Entreprise = models.CharField(max_length=200, null=True)
    TVA_Entreprise = models.CharField(max_length=50, null=True)

class Type_Adresse(models.Model):
    Type_Adresse = models.CharField(max_length=100)

class Pays(models.Model):
    Pays = models.CharField(max_length=100)
    Code_iso = models.CharField(max_length=10)

class Ville(models.Model):
    id_Ville = models.ForeignKey(Pays, on_delete=models.CASCADE)
    Ville = models.CharField(max_length=100)

class Code_Postal(models.Model):
    id_Ville = models.ForeignKey(Ville, on_delete=models.CASCADE)
    CP = models.CharField(max_length=15)

class Adresse(models.Model):
    id_CP = models.ForeignKey(Code_Postal, on_delete=models.CASCADE)
    Rue = models.CharField(max_length=200)
    Numero = models.CharField(max_length=15)
    Boite = models.CharField(max_length=15)

class Client_Adresse(models.Model):
    id_Client = models.ForeignKey(Client, on_delete=models.CASCADE)
    id_Adresse = models.ForeignKey(Adresse, on_delete=models.CASCADE)
    id_Type_Adresse = models.ForeignKey(Type_Adresse, on_delete=models.CASCADE)