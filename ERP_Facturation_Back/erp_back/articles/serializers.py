from rest_framework import serializers
from .models import Categorie, Article, Mouvements_Stock, TVA_Categorie_Pays
from datetime import date

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Categorie
        fields = ['id', 'categorie']

# Serializer qui créé un article et va également ajouter une ligne pour le mouvement de stock
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
    
    #En cas de mis à jour, comme de l'ajout de stock, créé une ligne dans mouvements qui montre l'ajout du stock
    def update(self, instance, validated_data):

        old_qty_stock = instance.qty_stock
        new_qty_stock = validated_data.get('qty_stock', old_qty_stock)

        if old_qty_stock != new_qty_stock:
            quantity_change = new_qty_stock - old_qty_stock

            type_mouvement = "Ajout" if quantity_change > 0 else "Sortie"
            description_mouvement = "Ajout d'articles au stock" if quantity_change > 0 else "Retrait d'articles du stock"

            Mouvements_Stock.objects.create(
                date_mouvement=date.today(),
                quantite=abs(quantity_change),
                type_mouvement=type_mouvement,
                description_mouvement=description_mouvement,
                article=instance
            )

        return super().update(instance, validated_data)
    
class TVACategoriePaysSerializer(serializers.ModelSerializer):
    pays = serializers.CharField(source='pays.pays', read_only=True)
    categorie = serializers.CharField(source='categorie.categorie', read_only=True)

    class Meta:
        model = TVA_Categorie_Pays
        fields = ['id', 'pays', 'categorie', 'tva']