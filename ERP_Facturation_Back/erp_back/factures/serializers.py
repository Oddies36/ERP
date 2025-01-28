from rest_framework import serializers
from .models import Article, Facture
from datetime import date

class FactureSerializer(serializers.ModelSerializer):
    class Meta:
        model = Facture
        fields = ['id', 'numero_facture', 'client', 'date_creation', 'date_echeance', 'prix_htva', 'prix_ttc', 'montant_tva', 'rappel1', 'rappel2', 'rappel3', 'statut', 'est_comptabilise']

