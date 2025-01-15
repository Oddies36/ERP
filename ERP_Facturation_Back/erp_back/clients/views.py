from django.shortcuts import render
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework.decorators import api_view
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from rest_framework.exceptions import AuthenticationFailed
from datetime import datetime
from rest_framework.response import Response
from .serializers import clientSerializer, paysSerializer, clientAdresseSerializer
from .models import Pays

@api_view(['POST'])
def get_clients(request):
  pass
  
@api_view(['POST'])
def new(request):
  serializer = clientAdresseSerializer(data=request.data)

  if serializer.is_valid():
    serializer.save()

    return Response({
      "success": True,
      "Message": "Nouveau client créé",
      "data": serializer.data
    }, status=201)

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