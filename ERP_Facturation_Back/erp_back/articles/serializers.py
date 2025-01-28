from rest_framework import serializers
from .models import Categorie, Article, Mouvements_Stock, TVA_Categorie_Pays
from datetime import date

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Categorie
        fields = ['id', 'categorie']

class ArticleSerializer(serializers.ModelSerializer):
    categorie_nom = serializers.CharField(source='categorie.categorie', read_only=True)
    class Meta:
        model = Article
        fields = ['id', 'categorie', 'categorie_nom', 'article', 'ean', 'prix_htva', 'description', 'prix_achat', 'qty_min', 'qty_oos', 'qty_order', 'qty_stock', 'unit', 'pourcentage_alc', 'volume', 'prix_consigne', 'qty_paquet', 'poids']

    def create(self, validated_data):

        article, created = Article.objects.get_or_create(**validated_data)

        if created:
            qty_commande = validated_data.get('qty_order', 0)
            date_mouvement = date.today()
            type_mouvement = "Ajout"
            description_mouvement = "Ajout en stock pour un nouvel article"

            Mouvements_Stock.objects.create(date_mouvement=date_mouvement, quantite=qty_commande, type_mouvement=type_mouvement, description_mouvement=description_mouvement, article=article)

        return article
    
class TVACategoriePaysSerializer(serializers.ModelSerializer):
    pays = serializers.CharField(source='pays.pays', read_only=True)
    categorie = serializers.CharField(source='categorie.categorie', read_only=True)

    class Meta:
        model = TVA_Categorie_Pays
        fields = ['id', 'pays', 'categorie', 'tva']