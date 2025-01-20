from rest_framework import serializers
from .models import Categorie

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Categorie
        fields = ['id', 'categorie']