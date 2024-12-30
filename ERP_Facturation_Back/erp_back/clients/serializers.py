from rest_framework import serializers
from .models import Client, Pays

class clientSerializer(serializers.Serializer):
  def method(self):
    pass

class paysSerializer(serializers.ModelSerializer):
  class Meta:
    model = Pays
    fields = ['id', 'pays', 'code_iso']