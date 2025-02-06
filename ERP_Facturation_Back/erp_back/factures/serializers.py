from rest_framework import serializers
from .models import Facture, DetailsFacture
from articles.serializers import ArticleSerializer
from clients.serializers import ClientSerializer

#La syntaxe '__all__' vise tout les fields dans la table
class FactureSerializer(serializers.ModelSerializer):
    client = ClientSerializer()
    class Meta:
        model = Facture
        fields = '__all__'

class DetailsFactureSerializer(serializers.ModelSerializer):
    article = ArticleSerializer()
    class Meta:
        model = DetailsFacture
        fields = '__all__'