from rest_framework import serializers
from .models import Client, Pays, Adresse, Ville, Code_Postal, Type_Adresse

class typeAdresseSerializer(serializers.ModelSerializer):
  class Meta:
    model = Type_Adresse
    fields = ['id', 'type_adresse']

class paysSerializer(serializers.ModelSerializer):
  class Meta:
    model = Pays
    fields = ['id', 'pays']

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
  code_postal = codepostalSerializer()
  type_adresses = typeAdresseSerializer(many=True)

  class Meta:
    model = Adresse
    fields = ['id', 'code_postal', 'rue', 'numero', 'boite', 'type_adresses']


# Serializer qui créé un nouveau client. Prend aussi les deux adresses (livraison et facturation) et va les lier au client
class ClientSerializer(serializers.ModelSerializer):
    
    adresses = adresseSerializer(many=True)

    class Meta:
        model = Client
        fields = ['id', 'nom', 'prenom', 'telephone', 'email', 'nom_entreprise', 'tva_entreprise', 'adresses']

    def create(self, validated_data):
        adresses_data = validated_data.pop('adresses', [])
        
        client, created = Client.objects.get_or_create(**validated_data)

        if not created:
            raise serializers.ValidationError({
                'Client': 'Client existe déjà.'
            })

        for adresse_data in adresses_data:
            code_postal_data = adresse_data.pop('code_postal')
            ville_data = code_postal_data.pop('ville')
            pays_data = ville_data.pop('pays')

            pays, _ = Pays.objects.get_or_create(**pays_data)
            ville, _ = Ville.objects.get_or_create(pays=pays, **ville_data)
            code_postal, _ = Code_Postal.objects.get_or_create(ville=ville, **code_postal_data)

            adresse, created = Adresse.objects.get_or_create(
                rue=adresse_data['rue'],
                numero=adresse_data['numero'],
                boite=adresse_data.get('boite', ''),
                code_postal=code_postal
            )

            type_adresses_data = adresse_data.pop('type_adresses', [])
            for type_adresse_data in type_adresses_data:
                type_adresse, _ = Type_Adresse.objects.get_or_create(**type_adresse_data)
                adresse.type_adresses.add(type_adresse)

            adresse.clients.add(client)

        return client


