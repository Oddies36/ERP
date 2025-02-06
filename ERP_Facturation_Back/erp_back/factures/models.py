from django.db import models
from clients.models import Client
from articles.models import Article
from datetime import datetime

import logging

logger = logging.getLogger(__name__)

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

    #Quand le model Facture est utilisé, le save() sera executé ce qui assigne un nouveau numéro de Facture
    def save(self, *args, **kwargs):
        # if not self.pk va etre None si l'objet n'existe pas encore. Si l'objet existe, le nouveau numéro ne sera pas créé
        if not self.pk:
            #Trie la liste des numéros en ordre DESC (avec -id) et prend le premier objet avec .first()
            last_facture = Facture.objects.order_by('-id').first()
            if last_facture:
                #Assigne le field numero_facture de la DB à number_facture
                number_facture = last_facture.numero_facture
                #Vu que le numéro de facture est une chaine, on va juste prendre le dernier numéro et pour ça il faut split.
                #Le format est FACT-2025-0001 donc on split sur le dernier -
                last_facture_number = int(number_facture.split('-')[-1])
                new_facture_number = f"FACT-{datetime.now().year}-{last_facture_number + 1:04d}"
            else:
                #S'il n'y a pas encore de factures, assigne 0001
                new_facture_number = f"FACT-{datetime.now().year}-0001"
            self.numero_facture = new_facture_number

            print(f"🔹 Nouveau numéro de facture généré: {self.numero_facture}")
            
            # ✅ Log it in Django logs
            logger.info(f"Nouveau numéro de facture généré: {self.numero_facture}")
        
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
    prix_total_htva = models.DecimalField(max_digits=10, decimal_places=2)
