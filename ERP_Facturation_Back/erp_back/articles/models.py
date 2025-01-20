from django.db import models
from clients.models import Pays


class Categorie(models.Model):
    categorie = models.CharField(max_length=255)

class Article(models.Model):
    categorie = models.ForeignKey(Categorie, on_delete=models.CASCADE, related_name="articles")
    article = models.CharField(max_length=255)
    ean = models.CharField(max_length=13, unique=True)
    prix_htva = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField(blank=True, null=True)
    prix_achat = models.DecimalField(max_digits=10, decimal_places=2)
    qty_min = models.IntegerField()
    qty_oos = models.IntegerField()
    qty_order = models.IntegerField()
    qty_stock = models.IntegerField()
    unit = models.CharField(max_length=50)
    pourcentage_alc = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    volume = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    consigne = models.BooleanField(default=False)
    qty_paquet = models.IntegerField()
    poids = models.DecimalField(max_digits=10, decimal_places=3, blank=True, null=True)

class TVA_Categorie_Pays(models.Model):
    pays = models.ForeignKey(Pays, on_delete=models.CASCADE, related_name="tva_categorie_pays")
    categorie = models.ForeignKey(Categorie, on_delete=models.CASCADE, related_name="tva_rates")
    tva = models.DecimalField(max_digits=5, decimal_places=2)

class Mouvements_Stock(models.Model):
    article = models.ForeignKey(Article, on_delete=models.CASCADE, related_name="mouvements")
    date_mouvement = models.DateTimeField(auto_now_add=True)
    quantite = models.IntegerField()
    type_mouvement = models.CharField(max_length=50)
    description_mouvement = models.TextField(blank=True, null=True)
