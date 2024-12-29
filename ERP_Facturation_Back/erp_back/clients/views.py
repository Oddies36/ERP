from django.shortcuts import render
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework.decorators import api_view
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from rest_framework.exceptions import AuthenticationFailed
from datetime import datetime
from rest_framework.response import Response
from .serializers import ClientSerializer

@api_view(['POST'])
def get_clients(request):
  serializer = UserSerializer(data=request.data)

  if serializer.is_valid():
    serializer.save()
    
    return Response({
      "success": True,
      "message": "Utilisateur créé avec succès",
      "data": serializer.data
      }, status=201)
  
  else:
    return Response({
      "success": False,
      "message": "Erreur lors de la création de l'utilisateur",
      "errors": serializer.errors
    }, status=400)
  
@api_view(['POST'])
def create_client(request):
  pass

@api_view(['POST'])
def delete_client(request):
  pass

@api_view(['POST'])
def modify_client(request):
  pass