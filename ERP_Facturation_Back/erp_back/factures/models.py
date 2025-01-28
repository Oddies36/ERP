from django.db import models
from clients.models import Client
from articles.models import Article
from datetime import datetime

class Facture(models.Model):
    numero_facture = models.CharField(max_length=50, unique=True)
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='factures')
    date_creation = models.DateField(auto_now_add=True)
    date_echeance = models.DateField()
    prix_htva = models.DecimalField(max_digits=10, decimal_places=2)
    prix_ttc = models.DecimalField(max_digits=10, decimal_places=2)
    montant_tva = models.DecimalField(max_digits=10, decimal_places=2)
    rappel1 = models.DateField(null=True, blank=True)
    rappel2 = models.DateField(null=True, blank=True)
    rappel3 = models.DateField(null=True, blank=True)
    statut = models.CharField(max_length=50)
    est_comptabilise = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        last_facture = Facture.objects.order_by('-id').first()
        if last_facture:
            number_facture = last_facture.numero_facture
            last_facture_number = int(number_facture.split('-')[-1])
            new_facture_number = f"FACT-{datetime.now().year}-{last_facture_number + 1:04d}"
        else:
            new_facture_number = f"FACT-{datetime.now().year}-0001"
        self.numero_facture = new_facture_number

        super().save(*args, **kwargs)
    


class DetailsFacture(models.Model):
    facture = models.ForeignKey(Facture, on_delete=models.CASCADE, related_name='details')
    article = models.ForeignKey(Article, on_delete=models.CASCADE, related_name='details_facture')
    numero_ligne = models.PositiveIntegerField()
    quantite = models.PositiveIntegerField()
    prix_article_htva = models.DecimalField(max_digits=10, decimal_places=2)
    prix_article_ttc = models.DecimalField(max_digits=10, decimal_places=2)
    montant_tva = models.DecimalField(max_digits=10, decimal_places=2)
    tva = models.DecimalField(max_digits=5, decimal_places=2)
    montant_promo = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
