from rest_framework import serializers
from .models import Client, Pays, Adresse, Ville, Code_Postal, Type_Adresse, Client_Adresse

class clientSerializer(serializers.Serializer):
  class Meta:
    model = Client
    fields = ['id', 'nom', 'prenom', 'telephone', 'email', 'nom_entreprise', 'tva_entreprise']

class typeAdresseSerializer(serializers.ModelSerializer):
  class Meta:
    model = Type_Adresse
    fields = ['id', 'type_adresse']

class paysSerializer(serializers.ModelSerializer):
  class Meta:
    model = Pays
    fields = ['id', 'pays', 'code_iso']

class villeSerializer(serializers.ModelSerializer):
  pays = paysSerializer()

  class Meta:
    model = Ville
    fields = ['id', 'pays', 'ville']

class codepostalSerializer(serializers.ModelSerializer):
  ville = villeSerializer()

  class Meta:
    model = Code_Postal
    fields = ['id', 'ville', 'cp']

class adresseSerializer(serializers.ModelSerializer):
  cp = codepostalSerializer()

  class Meta:
    model = Adresse
    fields = ['id', 'cp', 'rue', 'numero', 'boite']

class clientAdresseSerializer(serializers.ModelSerializer):
  client = clientSerializer()
  adresse = adresseSerializer()
  typeAdresse = typeAdresseSerializer()

  class Meta:
    model = Client_Adresse
    fields = ['client', 'adresse', 'type_adresse']

  def create(self,  validated_data):
    client_data = validated_data.pop('client')
    adresse_facturation_data = validated_data.pop('adresse_facturation')
    adresse_livraison_data = validated_data.pop('adresse_livraison')

    client, created = Client.objects.get_or_create(**client_data)

    if not created:
      raise serializers.ValidationError({"client": "Le client existe déjà"})

    