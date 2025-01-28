from rest_framework.decorators import api_view
from rest_framework.response import Response
from .serializers import ClientSerializer, paysSerializer, adresseSerializer
from .models import Pays, Client, Adresse

@api_view(['GET'])
def get_clients(request):
  clients = Client.objects.all()
  serializer = ClientSerializer(clients, many=True)

  return Response(serializer.data, status=200)
  
@api_view(['POST'])
def new(request):
  serializer = ClientSerializer(data=request.data)

  
  if serializer.is_valid():
    serializer.save()
    return Response({
      "success": True,
      "Message": "Nouveau client créé",
      "data": serializer.data
    }, status=201)

  print(serializer.errors)
  return Response({
      "success": False,
      "message": "Erreur lors de la création du client",
      "errors": serializer.errors
    }, status=400)


@api_view(['POST'])
def delete_client(request):
  pass

@api_view(['POST'])
def modify_client(request):
  pass

@api_view(['GET'])
def get_pays(request):
  pays = Pays.objects.all()
  serializer = paysSerializer(pays, many=True)

  return Response(serializer.data)

@api_view(['GET'])
def get_addresses_client(request, id_client):
  try:
    client = Client.objects.get(id=id_client)
    print(client)
  except Client.DoesNotExist:
    return Response({"erreur": "Le client n'existe pas."}, status=401)
  
  adresse_facturation = Adresse.objects.filter(clients=client, type_adresses__type_adresse="Facturation")
  adresse_livraison = Adresse.objects.filter(clients=client, type_adresses__type_adresse="Livraison")

  facturation_serializer = adresseSerializer(adresse_facturation, many=True)
  livraison_serializer = adresseSerializer(adresse_livraison, many=True)

  return Response({
    "facturation": facturation_serializer.data,
    "livraison": livraison_serializer.data
  }, status=200)
